import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { verifyAuth, unauthorized, requireRole, forbiddenResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://ikfzdigitalzulassung.de';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildCitySlug(title: string, slug?: string) {
  const base = (slug || title || '')
    .toLowerCase()
    .trim()
    .replace(/^auto-online-anmelden-in-/, '')
    .replace(/^kfz-zulassung-in-/, '')
    .replace(/^kfz-zulassung-/, '')
    .replace(/^zulassungsstelle-/, '')
    .replace(/^autoanmeldung-/, '')
    .replace(/^auto-anmelden-in-/, '')
    .replace(/^landkreis-/, '')
    .replace(/^in-/, '');

  const city = slugify(base);
  return `auto-online-anmelden-in-${city}`;
}

function prettifyCityFromSlug(slug: string) {
  return slug
    .replace(/^auto-online-anmelden-in-/, '')
    .replace(/^kfz-zulassung-in-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function buildCitySeo(slug: string) {
  const cityName = prettifyCityFromSlug(slug);
  const metaTitle = `Auto online anmelden in ${cityName} | Ohne Ausweis-PIN | IKFZ`;
  const metaDescription = `Auto online anmelden in ${cityName}. Ohne Termin, ohne Ausweis-PIN und mit schneller Bestätigung. Offiziell, deutschlandweit und mit persönlichem Support.`;

  return {
    metaTitle,
    metaDescription,
    canonicalUrl: `${SITE_URL}/${slug}/`,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    twitterTitle: metaTitle,
    twitterDesc: metaDescription,
  };
}

// GET /api/admin/pages - List pages with pagination
export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const pageType = searchParams.get('pageType') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')));
  const search = searchParams.get('search') || '';

  const where: any = {
    ...(status ? { status } : {}),
    ...(pageType ? { pageType } : {}),
    ...(search ? { title: { contains: search } } : {}),
  };

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        pageType: true,
        featuredImage: true,
        createdAt: true,
        updatedAt: true,
        seo: { select: { metaTitle: true, metaDescription: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.page.count({ where }),
  ]);

  return NextResponse.json({ pages, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/admin/pages - Create a new page
export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { title, slug, content, excerpt, status, pageType, featuredImage, seo } = body;

    if (!title || (!slug && pageType !== 'city')) {
      return NextResponse.json({ error: 'Titel und Slug erforderlich' }, { status: 400 });
    }

    const finalSlug =
      pageType === 'city'
        ? buildCitySlug(title, slug)
        : slugify(slug || title);

    const autoCitySeo = pageType === 'city' ? buildCitySeo(finalSlug) : null;

    const existing = await prisma.page.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug existiert bereits' }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug: finalSlug,
        content: content || '',
        excerpt: excerpt || '',
        status: status || 'draft',
        pageType: pageType || 'generic',
        featuredImage: featuredImage || null,
        ...((seo || autoCitySeo)
          ? {
              seo: {
                create: {
                  metaTitle: seo?.metaTitle || autoCitySeo?.metaTitle || title,
                  metaDescription: seo?.metaDescription || autoCitySeo?.metaDescription || excerpt || '',
                  canonicalUrl: seo?.canonicalUrl || autoCitySeo?.canonicalUrl || `${SITE_URL}/${finalSlug}/`,
                  ogTitle: seo?.ogTitle || autoCitySeo?.ogTitle || null,
                  ogDescription: seo?.ogDescription || autoCitySeo?.ogDescription || null,
                  ogImage: seo?.ogImage || null,
                  ogType: seo?.ogType || 'website',
                  twitterCard: seo?.twitterCard || 'summary_large_image',
                  twitterTitle: seo?.twitterTitle || autoCitySeo?.twitterTitle || null,
                  twitterDesc: seo?.twitterDesc || autoCitySeo?.twitterDesc || null,
                  twitterImage: seo?.twitterImage || null,
                  robots: seo?.robots || null,
                  schemaJson: seo?.schemaJson || null,
                },
              },
            }
          : {}),
      },
      include: { seo: true },
    });

    try {
      revalidatePath(`/${finalSlug}`);
      revalidatePath('/sitemap.xml');
    } catch (e) {
      console.warn('Revalidation:', e);
    }

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 });
  }
}

// PUT /api/admin/pages - Update a page
export async function PUT(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { id, title, slug, content, excerpt, status, pageType, featuredImage, seo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID erforderlich' }, { status: 400 });
    }

    const existingPage = await prisma.page.findUnique({
      where: { id },
      include: { seo: true },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Seite nicht gefunden' }, { status: 404 });
    }

    const resolvedPageType = pageType ?? existingPage.pageType;
    const isCityPage =
      resolvedPageType === 'city' ||
      existingPage.slug.startsWith('auto-online-anmelden-in-');

    const finalSlug = slug
      ? (isCityPage ? buildCitySlug(title || slug, slug) : slugify(slug))
      : undefined;

    const autoCitySeo =
      (finalSlug && isCityPage)
        ? buildCitySeo(finalSlug)
        : (isCityPage ? buildCitySeo(existingPage.slug) : null);

    if (finalSlug) {
      const existing = await prisma.page.findFirst({
        where: { slug: finalSlug, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Slug existiert bereits' }, { status: 409 });
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(finalSlug !== undefined ? { slug: finalSlug } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(pageType !== undefined ? { pageType } : {}),
        ...(featuredImage !== undefined ? { featuredImage } : {}),
      },
      include: { seo: true },
    });

    if ((seo || autoCitySeo) && page.seo) {
      await prisma.sEO.update({
        where: { id: page.seo.id },
        data: {
          ...(seo?.metaTitle !== undefined
            ? { metaTitle: seo.metaTitle }
            : autoCitySeo?.metaTitle
              ? { metaTitle: autoCitySeo.metaTitle }
              : {}),
          ...(seo?.metaDescription !== undefined
            ? { metaDescription: seo.metaDescription }
            : autoCitySeo?.metaDescription
              ? { metaDescription: autoCitySeo.metaDescription }
              : {}),
          ...(seo?.canonicalUrl !== undefined
            ? { canonicalUrl: seo.canonicalUrl }
            : autoCitySeo?.canonicalUrl
              ? { canonicalUrl: autoCitySeo.canonicalUrl }
              : {}),
          ...(seo?.ogTitle !== undefined
            ? { ogTitle: seo.ogTitle }
            : autoCitySeo?.ogTitle
              ? { ogTitle: autoCitySeo.ogTitle }
              : {}),
          ...(seo?.ogDescription !== undefined
            ? { ogDescription: seo.ogDescription }
            : autoCitySeo?.ogDescription
              ? { ogDescription: autoCitySeo.ogDescription }
              : {}),
          ...(seo?.ogImage !== undefined ? { ogImage: seo.ogImage } : {}),
          ...(seo?.ogType !== undefined ? { ogType: seo.ogType } : {}),
          ...(seo?.twitterCard !== undefined ? { twitterCard: seo.twitterCard } : {}),
          ...(seo?.twitterTitle !== undefined
            ? { twitterTitle: seo.twitterTitle }
            : autoCitySeo?.twitterTitle
              ? { twitterTitle: autoCitySeo.twitterTitle }
              : {}),
          ...(seo?.twitterDesc !== undefined
            ? { twitterDesc: seo.twitterDesc }
            : autoCitySeo?.twitterDesc
              ? { twitterDesc: autoCitySeo.twitterDesc }
              : {}),
          ...(seo?.twitterImage !== undefined ? { twitterImage: seo.twitterImage } : {}),
          ...(seo?.robots !== undefined ? { robots: seo.robots } : {}),
          ...(seo?.schemaJson !== undefined ? { schemaJson: seo.schemaJson } : {}),
        },
      });
    } else if ((seo || autoCitySeo) && !page.seo) {
      await prisma.sEO.create({
        data: {
          pageId: page.id,
          metaTitle: seo?.metaTitle || autoCitySeo?.metaTitle || page.title,
          metaDescription: seo?.metaDescription || autoCitySeo?.metaDescription || page.excerpt || '',
          canonicalUrl: seo?.canonicalUrl || autoCitySeo?.canonicalUrl || `${SITE_URL}/${page.slug}/`,
          ogTitle: seo?.ogTitle || autoCitySeo?.ogTitle || null,
          ogDescription: seo?.ogDescription || autoCitySeo?.ogDescription || null,
          ogImage: seo?.ogImage || null,
          ogType: seo?.ogType || 'website',
          twitterCard: seo?.twitterCard || 'summary_large_image',
          twitterTitle: seo?.twitterTitle || autoCitySeo?.twitterTitle || null,
          twitterDesc: seo?.twitterDesc || autoCitySeo?.twitterDesc || null,
          twitterImage: seo?.twitterImage || null,
          robots: seo?.robots || null,
          schemaJson: seo?.schemaJson || null,
        },
      });
    }

    const oldSlug = existingPage.slug;
    const newSlug = page.slug;

    try {
      if (oldSlug) revalidatePath(`/${oldSlug}`);
      if (newSlug) revalidatePath(`/${newSlug}`);
      revalidatePath('/sitemap.xml');
    } catch (e) {
      console.warn('Revalidation:', e);
    }

    const updated = await prisma.page.findUnique({
      where: { id },
      include: { seo: true },
    });

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 });
  }
}

// DELETE /api/admin/pages?id=X - Delete a page (admin only)
export async function DELETE(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();
  if (!requireRole(user, 'admin')) return forbiddenResponse();

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID erforderlich' }, { status: 400 });
  }

  try {
    await prisma.sEO.deleteMany({ where: { pageId: id } });
    await prisma.page.delete({ where: { id } });
    try {
      revalidatePath('/sitemap.xml');
    } catch (e) {
      console.warn('Revalidation:', e);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 });
  }
}
