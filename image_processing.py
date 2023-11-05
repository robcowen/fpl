import os
import cv2
import numpy as np
import math
import boto3
from dotenv import load_dotenv
from datetime import datetime

import requests
from io import BytesIO

debugging = False

def distance_to_line(line, point):
    x1, y1, x2, y2 = line
    px, py = point
    num = abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1)
    den = math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
    return num / den

# Function to calculate angle
def get_angle(line):
    x1, y1, x2, y2 = line
    angle = math.degrees(math.atan2(y2 - y1, x2 - x1))

    # Return absolute value of angle    
    return abs(angle)

def merge_lines(lines):
    if lines is None:
        return None
    
    # Your criteria for merging lines
    dist_threshold = 10  # Distance threshold
    angle_threshold = 10  # Angle difference threshold in degrees
    
    merged_lines = []
    for line in lines:
        merged = False
        for m_line in merged_lines:
            if line_close_to(line, m_line, dist_threshold, angle_threshold):
                # If line is close to an already merged line, merge them
                merge_line_to(m_line, line)
                merged = True
                break
        if not merged:
            # If the line was not merged to an existing one, add it as a new one
            merged_lines.append(line.copy())
    return merged_lines

def line_close_to(line1, line2, distance_threshold, angle_threshold):
    # Unpack line endpoints
    x1, y1, x2, y2 = line1[0]
    x3, y3, x4, y4 = line2[0]
    
    # Compute the midpoints of both lines
    midpoint1 = np.array([(x1 + x2) / 2, (y1 + y2) / 2])
    midpoint2 = np.array([(x3 + x4) / 2, (y3 + y4) / 2])
    
    # Check the distance between midpoints
    distance = np.linalg.norm(midpoint1 - midpoint2)
    
    # Compute the angles of each line with respect to the x-axis
    angle1 = np.arctan2((y2 - y1), (x2 - x1))
    angle2 = np.arctan2((y4 - y3), (x4 - x3))
    
    # Compute the difference in angles
    angle_diff = np.abs(angle1 - angle2)
    
    # Normalize the angle difference to the range [0, π]
    angle_diff = np.pi - angle_diff if angle_diff > np.pi else angle_diff
    
    # If lines are closer than the distance threshold and the angle between them is less
    # than the angle threshold, then they are considered 'close'
    return distance < distance_threshold and angle_diff < angle_threshold

# Function to merge two close lines, you'd replace this logic with something more robust
def merge_line_to(line1, line2):
    # For simplicity, just average the coordinates of the endpoints of the two lines
    x1, y1, x2, y2 = line1[0]
    x3, y3, x4, y4 = line2[0]
    
    # Averaging endpoints
    new_x1, new_y1 = (x1 + x3) / 2, (y1 + y3) / 2
    new_x2, new_y2 = (x2 + x4) / 2, (y2 + y4) / 2
    
    return [np.array([new_x1, new_y1, new_x2, new_y2], dtype=np.int32)]

def line_starts_from_circle_center(line, circle_center, circle_radius, proximity_threshold):
    x1, y1, x2, y2 = line[0]
    line_vec = np.array([x2 - x1, y2 - y1])
    center_to_line_start_vec = np.array([x1 - circle_center[0], y1 - circle_center[1]])

    # The distance from the center to the line
    distance = np.abs(np.cross(line_vec, center_to_line_start_vec)) / np.linalg.norm(line_vec)

    # If the distance is small enough, and the start of the line is within the circle, return True
    return distance < proximity_threshold and np.linalg.norm(center_to_line_start_vec) < circle_radius

def get_reading(angle, range):
    # Convert angle to pressure
    reading = angle * range / 180

    return reading

# Load environment variables from .env file
load_dotenv()

# Get the AWS access key ID and secret access key from environment variables
aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# Create a boto3 session with the credentials
session = boto3.Session(
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# Get all images from the S3 bucket
s3 = boto3.resource('s3')
bucket = s3.Bucket('robcowen-boiler')
images = list(bucket.objects.filter(Prefix='snapshots/'))

# Sort objects by last modified date
images.sort(key=lambda obj: obj.last_modified, reverse=True)

# Get the most recent object
latest_image = images[0] if images else None

# Get the latest image from the bucket
image_object = bucket.Object(latest_image.key)

image_content = image_object.get().get('Body').read()

# Prepare the bytes for OpenCV
image_as_np_array = np.frombuffer(image_content, np.uint8)
image_for_cv = cv2.imdecode(image_as_np_array, cv2.IMREAD_COLOR)



# Rotate the image 90 degrees anticlockwise
image = cv2.rotate(image_for_cv, cv2.ROTATE_90_COUNTERCLOCKWISE)

# Define the coordinates of the top-left and bottom-right corners of the desired area to crop
# Format: (x, y) where x is the horizontal axis and y is the vertical axis
top_left_corner = (297, 605)
bottom_right_corner = (396, 711)


# Crop the image using array slicing
# Note that the format is [y1:y2, x1:x2] because the image array is in the format of [rows, columns]
image = image[top_left_corner[1]:bottom_right_corner[1], top_left_corner[0]:bottom_right_corner[0]]

# cv2.imshow('Cropped image', image)

# Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


# Apply Gaussian blur
gray = cv2.GaussianBlur(gray, (5, 5), 0)


# Edge detection
edges = cv2.Canny(gray, 50, 150)

# Use Hough Circle Transform to find circles
circles = cv2.HoughCircles(edges, cv2.HOUGH_GRADIENT, dp=1, minDist=200, param1=50, param2=30, minRadius=0, maxRadius=0)

# If at least one circle is detected, proceed to find the gauge and needle
if circles is not None:
    circles = np.round(circles[0, :]).astype("int")
    for (x, y, r) in circles:
        print(x, y, r)
        # Draw the circle in the output image
        cv2.circle(image, (x, y), r, (0, 255, 0), 1)
        # Draw the center of the circle
        cv2.rectangle(image, (x - 2, y - 2), (x + 2, y + 2), (0, 128, 255), -1)

        # Add the circle centre coordinates to the list
        circle_centre = (x, y)
        circle_radius = r

        # Further processing to find the needle would go here
        # This could involve analyzing the area inside the circle for the needle line
        # and then calculating the angle of the needle with respect to the top of the gauge.

else:
    print("No circles found")
    exit()

# Distance threshold from the center of the circle to consider a line relevant
distance_threshold = 10  # Adjust as necessary

# Detect lines using Hough Transform
lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=5, minLineLength=20, maxLineGap=5)

lines = merge_lines(lines)

# Sort lines by y-coordinate ascending (first line will be pressure, second will be temperature)
lines = sorted(lines, key=lambda x: x[0][1])

# angles = []

pressure = None
temperature = None

# Draw the detected lines and calculate angles
if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]

        if line_starts_from_circle_center(line, circle_centre, circle_radius, 7):
            # Force line to start from the center of the circle
            
            # Find the end of the line closest to the circle center
            d1 = np.linalg.norm(np.array([x1, y1]) - circle_centre)
            d2 = np.linalg.norm(np.array([x2, y2]) - circle_centre)

            # Calculate angle
            angle = get_angle((x1, y1, x2, y2))

            # Draw the line for visualization
            cv2.line(image, (x1, y1), (x2, y2), (0, 0, 255), 2)

            # If the centre of the line is in the top half of the image
            if (y1 + y2) / 2 < image.shape[0] / 2:
                pressure = get_reading(angle, 4)
            
            # If the centre of the line is in the bottom half of the image
            else:
                temperature = get_reading(angle, 120)


print(f"Pressure: {pressure} bar")
print(f"Temperature: {temperature} °C")

if temperature is not None and pressure is not None:
    # Delete the image from the bucket
    # bucket.Object(latest_image.key).delete()

    pass

else:
    print("No reading found")
    debugging = True



if debugging:
    # Display the result
    cv2.imshow('Output', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Parse filename into datetime
filename = latest_image.key.split('/')[1].split('.')[0]

print(filename)

# Parse date and time from filename
timestamp = datetime.strptime(filename, '%Y%m%d%H%M%S')

print(timestamp)
