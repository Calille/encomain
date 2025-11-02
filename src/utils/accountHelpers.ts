/**
 * Account Helper Utilities
 * Functions for handling account operations with email notifications
 */
import { supabase } from '../lib/supabase';
import { sendAccountDeletionConfirmation } from './emailHelpers';
import { toast } from '../hooks/use-toast';

/**
 * Request account deletion and send confirmation email
 * @param userId - User ID to delete
 * @param userEmail - User's email address
 * @param userName - User's name (optional)
 * @param recoveryExpiryDays - Number of days until permanent deletion (default: 30)
 * @returns Deletion confirmation data
 */
export async function requestAccountDeletion(
  userId: string,
  userEmail: string,
  userName?: string,
  recoveryExpiryDays: number = 30
) {
  try {
    // Calculate deletion date
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + recoveryExpiryDays);
    
    // Generate recovery token (simple hash for now - should use proper token generation)
    const recoveryToken = btoa(`${userId}-${Date.now()}`).replace(/[+/=]/g, '');
    
    // Mark account for deletion in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'pending_deletion',
        deletion_date: deletionDate.toISOString(),
        deletion_token: recoveryToken,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Send account deletion confirmation email (fire and forget)
    try {
      await sendAccountDeletionConfirmation(
        userEmail,
        deletionDate.toISOString(),
        {
          userName: userName || 'there',
          recoveryUrl: `https://theenclosure.co.uk/recover-account?token=${recoveryToken}`,
          recoveryExpiryDate: deletionDate.toISOString(),
        }
      ).catch((error) => {
        console.error('Failed to send account deletion confirmation:', error);
      });
    } catch (error) {
      console.error('Error triggering account deletion confirmation:', error);
    }

    toast({
      title: 'Account deletion scheduled',
      description: `Your account will be deleted on ${deletionDate.toLocaleDateString()}. Check your email for recovery details.`,
    });

    // Sign out user
    await supabase.auth.signOut();

    return {
      deletionDate: deletionDate.toISOString(),
      recoveryToken,
    };
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to request account deletion. Please try again.',
      variant: 'destructive',
    });
    throw error;
  }
}

