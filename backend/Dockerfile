# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory
WORKDIR /usr/src/

# Install necessary packages
RUN apt-get update && apt-get install -y cron

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Add crontab file in the cron directory
COPY crontab /etc/cron.d/get_latest_blue

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/get_latest_blue

# Apply cron job
RUN crontab /etc/cron.d/get_latest_blue

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the command on container startup
CMD cron && tail -f /var/log/cron.log
