docker push nyamkamunhjin/skill-share-api
docker ps --quiet --filter="name=skill-share-api" | xargs --no-run-if-empty docker rm -f
docker run -dt -p 3001:3001 --restart always --name skill-share-api nyamkamunhjin/skill-share-api