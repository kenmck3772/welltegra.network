from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from azure.storage.blob import BlobServiceClient
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOUR LIVE AZURE CONNECTION
AZURE_CONN_STRING = "DefaultEndpointsProtocol=https;AccountName=scavengerforensicga92be;AccountKey=o07TfIL4qPZsUxyyD6c/cNsuQL6DmjkroGRKMSx5TugxNiTnSEHzpJYwobOfYbjg2PP25vpKHp/w+AStYEYJLA==;EndpointSuffix=core.windows.net"

@app.post("/scan/material")
async def audit_material(file: UploadFile = File(...)):
    content = await file.read()
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONN_STRING)
        blob_client = blob_service_client.get_blob_client(container="audit-logs", blob=file.filename)
        blob_client.upload_blob(content, overwrite=True)
        status = "✅ Evidence Secured in Azure"
    except Exception as e:
        status = f"❌ Sync Failed: {str(e)}"

    return {
        "filename": file.filename,
        "status": status,
        "vault_url": f"https://scavengerforensicga92be.blob.core.windows.net/audit-logs/{file.filename}"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
