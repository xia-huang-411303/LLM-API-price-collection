FROM python:3.9-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV API_KEY=app-5DJwE74ZkYcbteeUm9xQ7HiK

CMD ["python", "app.py"]
