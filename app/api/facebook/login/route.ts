import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;
  
  if (!clientId || clientId === 'your_facebook_app_id_here') {
    return NextResponse.json(
      { error: 'FACEBOOK_CLIENT_ID NOT CONFIGURED' }, 
      { status: 500 }
    );
  }

  const fbLoginUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  fbLoginUrl.searchParams.append('client_id', clientId);
  fbLoginUrl.searchParams.append('redirect_uri', redirectUri);
  // Requesting permissions for Pages
  fbLoginUrl.searchParams.append('scope', 'pages_manage_posts,pages_read_engagement,pages_show_list');
  fbLoginUrl.searchParams.append('response_type', 'code');
  fbLoginUrl.searchParams.append('state', 'AUTOMATE_AUTH_INIT'); // CSRF protection standard

  return NextResponse.redirect(fbLoginUrl.toString());
}
