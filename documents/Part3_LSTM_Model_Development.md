# Part 3: Model Development (LSTM Autoencoder)

## 📋 Table of Contents
1. [Overview](#overview)
2. [What is an LSTM Autoencoder?](#what-is-an-lstm-autoencoder)
3. [Why We Use This Model](#why-we-use-this-model)
4. [Step 1: Feature Scaling & Sequence Generation](#step-1-feature-scaling--sequence-generation)
5. [Step 2: Model Architecture](#step-2-model-architecture)
6. [Step 3: Model Training](#step-3-model-training)
7. [Step 4: Training Performance](#step-4-training-performance)
8. [Step 5: Save the Model](#step-5-save-the-model)
9. [Key Concepts Explained](#key-concepts-explained)
10. [What We Get From This Part](#what-we-get-from-this-part)

---

## Overview

**Part 3** is where we build and train the **"brain" of our system** - the LSTM Autoencoder model. This is the AI that learns what normal ship behavior looks like.

**Simple Explanation:**
- We take clean ship trajectory data
- We feed it to a neural network (AI model)
- The model learns patterns in normal ship movements
- After training, the model can recognize normal vs. unusual behavior

---

## What is an LSTM Autoencoder?

### Breaking Down the Name:

**LSTM (Long Short-Term Memory):**
- A type of **neural network** (artificial brain)
- Can **remember** patterns over time
- Perfect for sequences (like a ship's path over time)
- Similar to how humans remember a sequence of events

**Autoencoder:**
- A type of AI model that learns by **compression and reconstruction**
- **Encoder:** Compresses data into a summary
- **Decoder:** Tries to reconstruct the original from the summary
- If it can reconstruct well = the data is "normal"
- If it can't reconstruct well = the data is "unusual"

### Simple Analogy:

**Think of it like learning handwriting:**

1. **Training Phase:** You study many examples of a friend's normal handwriting
2. **Learning Phase:** Your brain creates a "pattern" of what their writing looks like
3. **Recognition Phase:** When you see new writing, you compare it to the pattern
4. **Detection Phase:** If the writing doesn't match the pattern, you know it's unusual

**Our LSTM Autoencoder does the same, but for ship paths:**
1. **Training:** Studies millions of normal ship trajectories
2. **Learning:** Creates a mathematical "pattern" of normal behavior
3. **Recognition:** Checks new ship paths against this pattern
4. **Detection:** Flags paths that don't match normal patterns

---

## Why We Use This Model

### Why LSTM?

**1. Handles Sequences:**
- Ship movements are sequences (positions over time)
- LSTM is designed for sequences (unlike regular neural networks)
- It can "remember" past positions when analyzing current position

**2. Learns Temporal Patterns:**
- Understands relationships between positions over time
- Knows that position at time T depends on positions at T-1, T-2, etc.
- Perfect for trajectory analysis

**3. Handles Long Dependencies:**
- Can remember patterns from 30 steps ago
- Understands how early positions affect later positions
- Important for analyzing ship paths

### Why Autoencoder?

**1. Unsupervised Learning:**
- We don't need labeled data (we don't need to mark each path as "normal" or "anomalous")
- The model learns from normal data automatically
- Perfect for anomaly detection

**2. Reconstruction Error:**
- If the model can reconstruct a path well = it's normal
- If reconstruction is poor = the path is unusual
- Simple and effective detection method

**3. Learns Normal Patterns:**
- By training only on normal data, the model learns what "normal" looks like
- Anything it can't reconstruct well is considered anomalous
- Intuitive and effective

### Why This Architecture?

**Encoder-Decoder Structure:**
- **Encoder:** Compresses 30 positions into a summary (latent vector)
- **Decoder:** Tries to reconstruct 30 positions from the summary
- **If successful:** The path is normal
- **If unsuccessful:** The path is unusual

---

## Step 1: Feature Scaling & Sequence Generation

### What is Feature Scaling?

**Simple Explanation:**
Neural networks work best when all inputs are in the same range (0 to 1). If one feature has values 0-1 and another has values 0-1000, the model might ignore the smaller one.

**What We Do:**
- Scale all features to 0-1 range using **MinMaxScaler**
- Formula: `scaled_value = (value - min) / (max - min)`
- All features now have the same scale

**Example:**
- **Before:** LAT = 40.5, LON = -74.0, SOG = 25.0, COG = 180.0
- **After:** LAT = 0.65, LON = 0.32, SOG = 0.50, COG = 0.50
- All values between 0 and 1

### What is Sequence Generation?

**Simple Explanation:**
The LSTM model needs sequences (multiple positions in order), not individual positions. We create "windows" of 30 consecutive positions.

**What We Do:**

1. **Group by Ship:** Group all positions by MMSI (ship ID)
2. **Sort by Time:** Sort each group chronologically
3. **Create Sliding Windows:** Extract windows of 30 consecutive positions
4. **Overlap Windows:** Stride = 5 (move window by 5 positions each time)

**Example:**
- **Ship has 100 positions**
- **Window 1:** Positions 0-29 (30 positions)
- **Window 2:** Positions 5-34 (30 positions, overlaps with Window 1)
- **Window 3:** Positions 10-39 (30 positions, overlaps with Window 2)
- And so on...

**Why Overlap?**
- Creates more training data
- Helps model learn better
- Each window is still valid (30 consecutive positions)

### Results:

- **Input Shape:** (1,006,037 sequences, 30 timesteps, 4 features)
- **Meaning:** 1+ million sequences, each with 30 positions, each position has 4 values (LAT, LON, SOG, COG)

---

## Step 2: Model Architecture

### The Model Structure:

**Our LSTM Autoencoder has 3 main parts:**

**1. Encoder LSTM:**
- **Input:** Sequence of 30 positions (30 timesteps × 4 features)
- **Output:** Latent vector (summary) of 128 dimensions
- **Purpose:** Compress the sequence into a summary

**2. Decoder LSTM:**
- **Input:** Latent vector (repeated 30 times)
- **Output:** Sequence of 30 hidden states (30 timesteps × 128 dimensions)
- **Purpose:** Decode the summary back into a sequence

**3. Output Layer (Linear):**
- **Input:** Hidden states from decoder (30 timesteps × 128 dimensions)
- **Output:** Reconstructed sequence (30 timesteps × 4 features)
- **Purpose:** Map hidden states back to original feature space

### Detailed Architecture:

```
Input: (Batch, 30, 4)
    ↓
Encoder LSTM: (30, 4) → (128)
    ↓
Latent Vector: (128) [Summary]
    ↓
Repeat 30 times: (30, 128)
    ↓
Decoder LSTM: (30, 128) → (30, 128)
    ↓
Output Layer: (30, 128) → (30, 4)
    ↓
Output: (Batch, 30, 4) [Reconstructed]
```

### Model Parameters:

- **Sequence Length:** 30 positions
- **Features:** 4 (LAT, LON, SOG, COG)
- **Embedding Dimension:** 128 (size of latent vector)
- **LSTM Layers:** 1 layer for encoder, 1 layer for decoder
- **Hidden Size:** 128 units

### How Forward Pass Works:

**Step-by-Step:**

1. **Encode:**
   - Feed 30-position sequence to encoder LSTM
   - LSTM processes each position sequentially
   - Take the final hidden state (summary of entire sequence)

2. **Repeat:**
   - Take the latent vector (128 dimensions)
   - Repeat it 30 times (one for each timestep)

3. **Decode:**
   - Feed repeated vector to decoder LSTM
   - Decoder processes each timestep
   - Outputs hidden states for each timestep

4. **Reconstruct:**
   - Pass hidden states through output layer (Linear transformation)
   - Maps 128 dimensions → 4 features (LAT, LON, SOG, COG)
   - Final output: 30 positions × 4 features

---

## Step 3: Model Training

### What is Training?

**Simple Explanation:**
Training is like teaching the model. We show it many examples of normal ship paths, and it learns to recognize patterns. Over time, it gets better at reconstructing normal paths.

### Training Process:

**1. Setup:**
- **Loss Function:** Mean Squared Error (MSE)
  - Measures how different reconstruction is from original
  - Lower = better (closer to original)
- **Optimizer:** Adam
  - Algorithm that updates model weights to reduce error
- **Epochs:** 10 (complete passes through all data)
- **Batch Size:** 64 (process 64 sequences at a time)
- **Learning Rate:** 0.001 (how fast model learns)

**2. Training Loop:**

For each epoch:
  - Process data in batches of 64
  - For each batch:
    - Feed sequences to model
    - Model reconstructs sequences
    - Calculate error (difference between original and reconstruction)
    - Update model weights to reduce error
  - Calculate average error for epoch

**3. Training Progress:**

- **Epoch 2:** Error = 0.000828
- **Epoch 4:** Error = 0.000109
- **Epoch 6:** Error = 0.000063
- **Epoch 8:** Error = 0.000041
- **Epoch 10:** Error = 0.000031

**Improvement:** Error decreased by ~96% (from 0.000828 to 0.000031)

### Why This is Good:

- **Error Decreases:** Model is learning
- **Converges:** Error levels off (model has learned enough)
- **Low Final Error:** Model reconstructs normal paths very well

---

## Step 4: Training Performance

### What is Training Performance?

**Simple Explanation:**
We visualize how well the model learned by plotting the error over time. A good model shows decreasing error that eventually levels off.

### What We Check:

**1. Training Loss Curve:**
- Plot error (loss) vs. epochs
- Should decrease smoothly
- Should level off (converge)

**2. What Good Training Looks Like:**
- **Steep decrease:** Model learns quickly
- **Smooth curve:** Stable learning (no wild jumps)
- **Levels off:** Model has learned (no more improvement needed)

### Our Results:

- **Initial Error:** 0.000828
- **Final Error:** 0.000031
- **Reduction:** 96% decrease
- **Pattern:** Smooth, decreasing curve
- **Conclusion:** Model learned successfully! ✅

---

## Step 5: Save the Model

### Why Save the Model?

**Simple Explanation:**
Training takes time (especially with millions of data points). Once trained, we save the model so we can use it later without retraining.

### What We Save:

**1. Model Weights (`ais_lstm_autoencoder.pth`):**
- All the learned parameters (weights and biases)
- This is the "knowledge" the model learned
- File size: ~500 KB

**2. Scaler (`scaler.pkl`):**
- The normalization parameters (min/max values for each feature)
- **Critical:** We need this to normalize new data the same way
- File size: ~1 KB

### Why Both Are Important:

- **Model:** The learned patterns
- **Scaler:** How to prepare new data (must use same scaling as training data)

**Without the scaler:** New data won't be scaled correctly → model predictions will be wrong!

---

## Key Concepts Explained

### 1. Neural Network (Simple Explanation)

**What:** A computer program modeled after the human brain
- **Neurons:** Small processing units (like brain cells)
- **Connections:** Neurons connected with weights
- **Learning:** Adjusting weights to minimize error

**Analogy:** Like training a dog - reward good behavior (correct predictions), adjust for mistakes (reduce error)

### 2. LSTM (Long Short-Term Memory)

**What:** A type of neural network that can remember information over time

**Key Feature:** 
- Can "remember" what happened 30 steps ago
- Can "forget" irrelevant information
- Perfect for sequences (time series data)

**Analogy:** Like reading a book - you remember earlier pages when reading later pages

### 3. Autoencoder

**What:** A model that learns by compression and reconstruction

**How it Works:**
1. **Compress:** Reduce data to a smaller representation (summary)
2. **Reconstruct:** Try to recreate original from summary
3. **Learn:** If reconstruction is poor, adjust to improve

**Analogy:** Like summarizing a story - good summary allows you to recreate the story accurately

### 4. Embedding/Latent Vector

**What:** A compressed representation of the data

**Size:** 128 dimensions (128 numbers representing the entire 30-position sequence)

**Purpose:** Captures essential information in a compact form

**Analogy:** Like a ZIP file - compressed version of data that can be expanded back

### 5. Reconstruction Error

**What:** Difference between original and reconstructed data

**Calculation:** Mean Squared Error (MSE)
- Average of squared differences
- Lower = better reconstruction

**Use:** 
- Low error = Normal behavior (model can reconstruct well)
- High error = Anomalous behavior (model cannot reconstruct well)

### 6. Gradient Descent (Optimization)

**What:** Algorithm that finds optimal model weights

**How:**
1. Calculate error
2. Calculate gradient (direction of steepest increase in error)
3. Move in opposite direction (reduce error)
4. Repeat until error is minimized

**Analogy:** Like finding the bottom of a valley by always going downhill

### 7. Batch Processing

**What:** Processing multiple sequences at once

**Why:**
- Faster training (GPU can process multiple sequences simultaneously)
- More stable learning (averages over batch)
- Memory efficient (doesn't load all data at once)

**Batch Size:** 64 (process 64 sequences at a time)

---

## What We Get From This Part

### Deliverables:

**1. Trained Model:**
- ✅ LSTM Autoencoder model trained on normal ship data
- ✅ Can reconstruct normal trajectories well
- ✅ Ready for anomaly detection

**2. Saved Files:**
- ✅ `ais_lstm_autoencoder.pth` (model weights)
- ✅ `scaler.pkl` (normalization parameters)

**3. Training Metrics:**
- ✅ Training loss curve
- ✅ Final error: 0.000031 (very low)
- ✅ 96% error reduction during training

**4. Understanding:**
- ✅ Model architecture and how it works
- ✅ Training process and results
- ✅ Model is ready for deployment

### Why This Matters:

**For Part 4 (Anomaly Detection):**
- Trained model can distinguish normal vs. unusual paths
- Low reconstruction error for normal paths
- High reconstruction error for anomalous paths

**For Production Use:**
- Model can be loaded and used on new data
- Scaler ensures new data is processed correctly
- System is ready for real-time anomaly detection

---

## Summary

**Part 3 is about Building and Training the AI:**

1. **Prepare Data:** Scale features, create sequences
2. **Build Model:** Design LSTM Autoencoder architecture
3. **Train Model:** Teach the model normal patterns
4. **Evaluate:** Check training performance
5. **Save:** Store model for future use

**Key Takeaway:**
We trained an AI model that learned what normal ship behavior looks like. The model can now reconstruct normal paths very well (low error), which means it will struggle with unusual paths (high error) - perfect for anomaly detection!

**Next Step:**
In Part 4, we'll use this trained model to detect anomalies by measuring reconstruction errors.

---

*Document created: January 2025*
*Part: 3 of 6*
*Topic: LSTM Autoencoder Model Development*
