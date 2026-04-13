import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/settings?error=oauth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=no_code', request.url));
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;

  try {
    // 1. Exchange code for short-lived access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: clientId,
        redirect_uri: redirectUri,
        client_secret: clientSecret,
        code,
      }
    });

    const shortLivedToken = tokenResponse.data.access_token;

    // 2. Exchange short-lived token for a long-lived user token
    const longLivedResponse = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    const longLivedUserToken = longLivedResponse.data.access_token;

    // 3. Save to database for the authenticated user
    await prisma.user.update({
      where: { id: user.id },
      data: { facebookToken: longLivedUserToken }
    });

    return NextResponse.redirect(new URL('/settings?success=connected', request.url));
  } catch (err: any) {
    console.error('Facebook OAuth Error:', err.response?.data || err.message);
    return NextResponse.redirect(new URL('/settings?error=exchange_failed', request.url));
  }
}
