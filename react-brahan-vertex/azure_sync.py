from azure.storage.blob import BlobServiceClient

# Note: You will replace this string with the key from your Azure Portal
AZURE_STORAGE_CONNECTION_STRING = "your_actual_connection_string_here"

def upload_to_brahan_cloud(file_name, data):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        blob_client = blob_service_client.get_blob_client(container="audit-logs", blob=file_name)
        blob_client.upload_blob(data, overwrite=True)
        print(f"Successfully uploaded {file_name} to Brahan Cloud.")
    except Exception as e:
        print(f"Failed to upload: {e}")

if __name__ == "__main__":
    print("Azure Sync Module Loaded.")
