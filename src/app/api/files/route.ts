import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const canonicalId = searchParams.get('canonicalId');

        let query: any = adminDb.collection('files');

        if (canonicalId) {
            query = query.where('canonicalId', '==', canonicalId);
        } else {
            // Limit if no filter to avoid massive payload
            query = query.limit(100);
        }

        const snapshot = await query.get();
        const files = snapshot.docs.map((doc: any) => {
            const data = doc.data();

            // Construct Drive Folder Link based on type
            let driveLink = '';
            if (data.type === 'pdf') driveLink = `https://drive.google.com/drive/folders/${process.env.DRIVE_PDF_FOLDER_ID}`;
            else if (data.type === 'excel') driveLink = `https://drive.google.com/drive/folders/${process.env.DRIVE_EXCEL_FOLDER_ID}`;
            else driveLink = `https://drive.google.com/drive/folders/${process.env.DRIVE_CSV_FOLDER_ID}`;

            return {
                id: doc.id,
                ...data,
                driveFolderLink: driveLink
            };
        });

        return NextResponse.json(files);
    } catch (error: any) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
