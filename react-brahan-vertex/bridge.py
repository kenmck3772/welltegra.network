from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from azure.storage.blob import BlobServiceClient
import uvicorn

app = FastAPI()

# Allow your Frontend (Port 3000) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOUR SECURE CLOUD LINK
AZURE_CONN_STRING = "DefaultEndpointsProtocol=https;AccountName=scavengerforensicga92be;AccountKey=o07TfIL4qPZsUxyyD6c/cNsuQL6DmjkroGRKMSx5TugxNiTnSEHzpJYwobOfYbjg2PP25vpKHp/w+AStYEYJLA==;EndpointSuffix=core.windows.net"

@app.post("/scan/material")
async def audit_material(file: UploadFile = File(...)):
    content = await file.read()
    
    # 1. TELEPORT TO AZURE
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONN_STRING)
        blob_client = blob_service_client.get_blob_client(container="audit-logs", blob=file.filename)
        blob_client.upload_blob(content, overwrite=True)
        cloud_status = "✅ Sync Success"
    except Exception as e:
        cloud_status = f"❌ Sync Failed: {str(e)}"

    return {
        "filename": file.filename,
        "azure_vault": f"https://scavengerforensicga92be.blob.core.windows.net/audit-logs/{file.filename}",
        "cloud_status": cloud_status,
        "forensic_verdict": "Evidence Secured"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
