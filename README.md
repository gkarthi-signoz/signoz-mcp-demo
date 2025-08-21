# LangChain SigNoz MCP Demo

Using OpenInference and OpenTelemetry to send traces from your LangChain MCP agent app to Signoz

## Getting Started
First, install all the necessary dependencies for the backend:

*Optional*
Create Python virtual env:
```bash
python -m venv myenv && \
source myenv/bin/activate
```
Then:
```bash
pip install -r requirements.txt
```

Install all the necessary dependencies for the frontend:
```bash
cd frontend && \
npm install
```

Next create a .env file with the following(in root directory):
```bash
OPENAI_API_KEY=<your-openai-api-key>
SIGNOZ_INGESTION_KEY=<your-signoz-ingestion-key>
```


**Setup MCP server**: Follow the [README](https://github.com/DrDroidLab/signoz-mcp-server/blob/master/README.md) in the following [repo](https://github.com/DrDroidLab/signoz-mcp-server) to setup and deploy the signoz 
mcp server locally (default localhost port 8000).



Run the fastapi backend:
```bash
uvicorn main:app --reload --port 8001
```

Run the frontend:
```bash
cd frontend && \
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result and interact with the application.

## After using the application, you should be able to view traces in your SigNoz Cloud platform:

### Traces
 <img width="1093" height="60" alt="Screenshot 2025-08-21 at 11 33 51 AM" src="https://github.com/user-attachments/assets/77e83917-8d3a-4b55-a4ff-a4a32d6db9cf" />
 <img width="1456" height="761" alt="Screenshot 2025-08-21 at 11 33 00 AM" src="https://github.com/user-attachments/assets/1120344b-5da8-4d92-8514-b6080686b672" />




## You can also create custom dashboards using these traces and span attributes:

### Import Dashboard
Go to the **Dashboards** tab in SigNoz.

Click on **+ New Dashboard**

Go to **Import JSON**
<img width="1510" height="788" alt="dashboard_import" src="https://github.com/user-attachments/assets/31bd73c5-84d2-4cd5-9bc0-be8a8169043b" />


Import the **langchain-mcp-dashboard.json** file from the repo.

Your dashboard should now be imported and look something like this:
<img width="1446" height="752" alt="Screenshot 2025-08-21 at 11 37 25 AM" src="https://github.com/user-attachments/assets/48f3d8ef-bfe0-4a85-a87d-20923b15bb58" />

