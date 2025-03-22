import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const folderPath = searchParams.get("path") || process.cwd();
        
        // Read directory contents
        const items = fs.readdirSync(folderPath, { withFileTypes: true });
        
        // Process directory contents
        const content = items.map(item => {
            return {
                name: item.name,
                isDirectory: item.isDirectory(),
                path: path.join(folderPath, item.name)
            };
        });
        
        // Get parent folder path
        const parentPath = path.dirname(folderPath);
        
        return new Response(JSON.stringify({ 
            content,
            parent: parentPath !== folderPath ? parentPath : null
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ 
            error: error.message 
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}