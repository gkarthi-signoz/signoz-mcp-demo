from langchain import hub
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import List, TypedDict
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders import TextLoader
import os
from dotenv import load_dotenv
from opentelemetry import trace
from opentelemetry.propagate import extract, inject
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from openinference.instrumentation.langchain import LangChainInstrumentor #openifnerence
from opentelemetry.instrumentation.langchain import LangchainInstrumentor #openllemetry
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableLambda
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
import requests
from pydantic import BaseModel, Field
from fastapi import FastAPI, Request, Query, HTTPException, Header
from typing import Optional
from langchain.chat_models import init_chat_model
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver
import uuid
import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client
from mcp.client.stdio import stdio_client
from langchain_mcp_adapters.tools import load_mcp_tools
import logging
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor





load_dotenv()


#open inference
resource = Resource.create({"service.name": "langchain-mcp-openinference"})
# Configure the OTLP exporter for your custom endpoint
provider = TracerProvider(resource=resource)
otlp_exporter = OTLPSpanExporter(
    # Change to your provider's endpoint
    endpoint="https://ingest.us.signoz.cloud:443/v1/traces",
    # Add any required headers for authentication
    headers={"signoz-ingestion-key": os.getenv("SIGNOZ_INGESTION_KEY")},
)
processor = BatchSpanProcessor(otlp_exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

LangChainInstrumentor().instrument()

# Changing model to o3 gives more accurate answer and reduces rate limit
#llm = init_chat_model("o3", model_provider="openai")
# gpt-4-turbo
#gpt-4o
llm = init_chat_model("gpt-4o", model_provider="openai")


# Define a FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
FastAPIInstrumentor.instrument_app(app)

# Global variables for agent, tools, and memory

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
async def query_endpoint(
    request: QueryRequest,
    traceparent: Optional[str] = Header(None)
):
    # Extract trace context from traceparent header
    carrier = {}
    if traceparent:
        carrier["traceparent"] = traceparent
    
    ctx = extract(carrier)
    tracer = trace.get_tracer(__name__)
    
    with tracer.start_as_current_span("query_endpoint", context=ctx) as span:
        # print("Initializing tools and agent...")
        async with streamablehttp_client("http://34.201.154.119:8000/mcp") as (read, write, _):
        #async with streamablehttp_client("http://localhost:8000/mcp") as (read, write, _):
            async with ClientSession(read, write) as session:
                # Initialize the connection
                await session.initialize()
                tools = await load_mcp_tools(session)
                memory = MemorySaver()
                agent = create_react_agent(llm, tools, checkpointer=memory, max_iterations=10,trim_intermediate_steps=True) # This is crucial
                config = {"configurable": {"thread_id": str(uuid.uuid4()), "max_messages": 10}}
                response = await agent.ainvoke({"messages": request.query}, config)
                return {"response": response["messages"][-1].content}
