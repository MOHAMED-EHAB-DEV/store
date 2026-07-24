import { Readable } from 'stream';

export async function uploadToGoogleDrive(file: File) {
  try {
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Convert Web API File to a Node.js Readable Stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata: any = {
      name: file.name,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: file.type || 'application/octet-stream',
      body: stream,
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    if (!res.data.id) {
      throw new Error('Failed to upload file to Google Drive. No ID returned.');
    }

    return res.data.id;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

export async function getGoogleDriveDownloadUrlAndToken(fileId: string) {
  const { google } = await import('googleapis');
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const tokenRes = await oauth2Client.getAccessToken();
  
  if (!tokenRes.token) {
    throw new Error('Failed to get access token from Google Drive');
  }

  return {
    url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    token: tokenRes.token
  };
}
