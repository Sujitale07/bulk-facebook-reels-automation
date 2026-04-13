'use server';

import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function getConnectedPages() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user || !user.facebookToken) {
      return { success: false, error: 'META_AUTH_REQUIRED' };
    }

    const response = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
      params: {
        access_token: user.facebookToken
      }
    });

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error('Failed to fetch pages:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error?.message || 'FAILED_TO_FETCH_PAGES' };
  }
}

export async function savePageSelection(pageId: string, pageAccessToken: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'NODE_AUTH_REQUIRED' };

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pageId,
        pageAccessToken
      }
    });

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save page selection:', error.message);
    return { success: false, error: 'DATABASE_WRITE_FAILED' };
  }
}
