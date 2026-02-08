FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential libgl1-mesa-glx && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir streamlit fastapi uvicorn python-multipart pandas numpy lasio pdfplumber dlisio segyio requests folium streamlit-folium matplotlib pillow
COPY . .
EXPOSE 8000
EXPOSE 8501
