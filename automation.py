import asyncio
import aiohttp

URL = "http://localhost:8001/query"
DATA = {"query": "give me services which are active in the last 10 days"}
NUM_REQUESTS = 10

async def send_post(session, url, data):
    try:
        async with session.post(url, json=data) as response:
            text = await response.text()
            print(f"Status: {response.status}, Response: {text}")
    except Exception as e:
        print(f"Request failed: {e}")

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [send_post(session, URL, DATA) for _ in range(NUM_REQUESTS)]
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
