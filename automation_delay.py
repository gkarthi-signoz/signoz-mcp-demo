import asyncio
import aiohttp
import time

URL = "http://localhost:8001/query"
DATA = {"query": "give me services which are active in the last 10 days"}
NUM_REQUESTS = 100
REQUESTS_PER_MINUTE = 100  # change this to your desired rate

DELAY_BETWEEN_REQUESTS = 60 / REQUESTS_PER_MINUTE

async def send_post(session, url, data, delay):
    await asyncio.sleep(delay)  # stagger start times
    try:
        async with session.post(url, json=data) as response:
            text = await response.text()
            print(f"Status: {response.status}, Response: {text}")
    except Exception as e:
        print(f"Request failed: {e}")

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(NUM_REQUESTS):
            delay = i * DELAY_BETWEEN_REQUESTS
            tasks.append(send_post(session, URL, DATA, delay))
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
