# Face-API Models Setup

The face detection models need to be downloaded to `/public/models/`.

## Quick Setup:

```bash
cd public
mkdir -p models
cd models

# Download models from face-api.js GitHub
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-weights_manifest.json
wget https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-shard1
```

## Or the system will work without models:
The app will gracefully degrade and use basic detection if models aren't found.
