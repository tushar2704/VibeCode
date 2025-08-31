# 🧠 Data Science & AI Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Intelligent Data-Driven Solutions*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for data science insights and best practices

---

## Overview

Data Science and AI development enables intelligent automation and insights from data. This guide covers **Python/R ecosystems**, **machine learning frameworks**, **MLOps**, **deployment strategies**, and **Context Engineering** methodology for production-ready AI solutions.

## 🐍 Python ML Development

### Complete ML Pipeline

```python
# ml_pipeline.py - Production-ready ML pipeline
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import mlflow
import mlflow.sklearn
import joblib
from typing import Tuple, Dict, Any

class MLPipeline:
    """Complete ML pipeline with experiment tracking"""
    
    def __init__(self, experiment_name: str = "ml_experiment"):
        self.experiment_name = experiment_name
        self.model = None
        self.scaler = StandardScaler()
        mlflow.set_experiment(experiment_name)
        
    def load_data(self, data_path: str, target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Load and prepare dataset"""
        df = pd.read_csv(data_path)
        
        # Handle missing values
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col != target_column:
                df[col] = df[col].fillna(df[col].mode()[0])
        
        # Encode categorical variables
        df_encoded = pd.get_dummies(df.drop(columns=[target_column]))
        
        X = df_encoded
        y = df[target_column]
        
        return X, y
    
    def train_model(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Train and evaluate model"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        with mlflow.start_run():
            # Train model
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
            
            accuracy = self.model.score(X_test_scaled, y_test)
            auc_score = roc_auc_score(y_test, y_pred_proba)
            
            # Log metrics
            mlflow.log_metric("accuracy", accuracy)
            mlflow.log_metric("auc_score", auc_score)
            mlflow.sklearn.log_model(self.model, "model")
            
            print(f"Accuracy: {accuracy:.4f}, AUC: {auc_score:.4f}")
            
            return {
                'model': self.model,
                'accuracy': accuracy,
                'auc_score': auc_score,
                'predictions': y_pred
            }
    
    def hyperparameter_tuning(self, X: pd.DataFrame, y: pd.Series):
        """Perform hyperparameter optimization"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 20, None],
            'min_samples_split': [2, 5, 10]
        }
        
        with mlflow.start_run():
            grid_search = GridSearchCV(
                RandomForestClassifier(random_state=42),
                param_grid, cv=5, scoring='roc_auc', n_jobs=-1
            )
            grid_search.fit(X_train_scaled, y_train)
            
            self.model = grid_search.best_estimator_
            
            # Evaluate
            accuracy = self.model.score(X_test_scaled, y_test)
            y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
            auc_score = roc_auc_score(y_test, y_pred_proba)
            
            # Log results
            mlflow.log_params(grid_search.best_params_)
            mlflow.log_metric("best_cv_score", grid_search.best_score_)
            mlflow.log_metric("test_accuracy", accuracy)
            mlflow.log_metric("test_auc", auc_score)
            
            print(f"Best params: {grid_search.best_params_}")
            print(f"Test accuracy: {accuracy:.4f}, AUC: {auc_score:.4f}")
            
            return self.model
    
    def save_model(self, model_path: str):
        """Save trained model"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, model_path)
        print(f"Model saved to {model_path}")
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions on new data"""
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

# Usage
pipeline = MLPipeline("customer_churn")
X, y = pipeline.load_data("data.csv", "target")
results = pipeline.train_model(X, y)
best_model = pipeline.hyperparameter_tuning(X, y)
pipeline.save_model("model.pkl")
```

### Deep Learning with PyTorch

```python
# pytorch_model.py - Neural network with PyTorch Lightning
import torch
import torch.nn as nn
import pytorch_lightning as pl
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
import mlflow.pytorch

class ImageClassifier(pl.LightningModule):
    """CNN for image classification"""
    
    def __init__(self, num_classes=10, learning_rate=1e-3):
        super().__init__()
        self.save_hyperparameters()
        
        self.conv_layers = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )
        
        self.criterion = nn.CrossEntropyLoss()
        
    def forward(self, x):
        x = self.conv_layers(x)
        return self.classifier(x)
    
    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = self.criterion(y_hat, y)
        acc = (y_hat.argmax(dim=1) == y).float().mean()
        
        self.log('train_loss', loss, prog_bar=True)
        self.log('train_acc', acc, prog_bar=True)
        return loss
    
    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = self.criterion(y_hat, y)
        acc = (y_hat.argmax(dim=1) == y).float().mean()
        
        self.log('val_loss', loss, prog_bar=True)
        self.log('val_acc', acc, prog_bar=True)
        return loss
    
    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=self.hparams.learning_rate)

def train_model():
    """Train the image classification model"""
    # Data preparation
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
    ])
    
    dataset = datasets.CIFAR10('./data', train=True, download=True, transform=transform)
    train_data, val_data = random_split(dataset, [45000, 5000])
    
    train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=64)
    
    # Model and trainer
    model = ImageClassifier(num_classes=10)
    trainer = pl.Trainer(max_epochs=10, accelerator='auto')
    
    # Train
    trainer.fit(model, train_loader, val_loader)
    
    # Log to MLflow
    mlflow.pytorch.log_model(model, "pytorch_model")
    
    return model

if __name__ == "__main__":
    model = train_model()
```

## 📊 R Data Analysis

### Statistical Analysis Framework

```r
# data_analysis.R - Comprehensive R analysis
library(tidyverse)
library(caret)
library(randomForest)
library(plotly)
library(shiny)

# Data Analysis Class
DataAnalyzer <- R6::R6Class(
  "DataAnalyzer",
  public = list(
    data = NULL,
    
    initialize = function(data_path = NULL) {
      if (!is.null(data_path)) {
        self$data <- read_csv(data_path)
      }
    },
    
    explore_data = function() {
      # Summary statistics
      summary_stats <- self$data %>%
        summarise_all(list(
          mean = ~mean(., na.rm = TRUE),
          median = ~median(., na.rm = TRUE),
          sd = ~sd(., na.rm = TRUE)
        ))
      
      # Correlation matrix
      numeric_data <- self$data %>% select_if(is.numeric)
      correlation <- cor(numeric_data, use = "complete.obs")
      
      # Visualizations
      p1 <- self$data %>%
        select_if(is.numeric) %>%
        gather() %>%
        ggplot(aes(x = value)) +
        geom_histogram(bins = 30, fill = "steelblue") +
        facet_wrap(~key, scales = "free") +
        theme_minimal()
      
      list(
        summary = summary_stats,
        correlation = correlation,
        distribution_plot = p1
      )
    },
    
    build_model = function(target_var, test_size = 0.2) {
      # Prepare data
      complete_data <- self$data %>% 
        drop_na() %>%
        mutate_if(is.character, as.factor)
      
      # Split data
      set.seed(42)
      train_index <- createDataPartition(complete_data[[target_var]], 
                                       p = 1 - test_size, list = FALSE)
      train_data <- complete_data[train_index, ]
      test_data <- complete_data[-train_index, ]
      
      # Train Random Forest
      rf_model <- randomForest(
        formula = as.formula(paste(target_var, "~ .")),
        data = train_data,
        ntree = 500,
        importance = TRUE
      )
      
      # Predictions and evaluation
      predictions <- predict(rf_model, test_data)
      
      if (is.factor(complete_data[[target_var]])) {
        # Classification
        conf_matrix <- confusionMatrix(predictions, test_data[[target_var]])
        accuracy <- conf_matrix$overall['Accuracy']
        
        result <- list(
          model = rf_model,
          predictions = predictions,
          accuracy = accuracy,
          confusion_matrix = conf_matrix
        )
      } else {
        # Regression
        rmse <- sqrt(mean((predictions - test_data[[target_var]])^2))
        r2 <- cor(predictions, test_data[[target_var]])^2
        
        result <- list(
          model = rf_model,
          predictions = predictions,
          rmse = rmse,
          r_squared = r2
        )
      }
      
      return(result)
    },
    
    create_dashboard = function() {
      ui <- fluidPage(
        titlePanel("Data Analysis Dashboard"),
        sidebarLayout(
          sidebarPanel(
            fileInput("file", "Upload CSV"),
            selectInput("target", "Target Variable:", choices = NULL),
            actionButton("analyze", "Analyze")
          ),
          mainPanel(
            tabsetPanel(
              tabPanel("Data", DT::dataTableOutput("data_table")),
              tabPanel("Summary", verbatimTextOutput("summary")),
              tabPanel("Plots", plotlyOutput("plots")),
              tabPanel("Model", verbatimTextOutput("model_results"))
            )
          )
        )
      )
      
      server <- function(input, output, session) {
        values <- reactiveValues(data = NULL, results = NULL)
        
        observeEvent(input$file, {
          values$data <- read_csv(input$file$datapath)
          updateSelectInput(session, "target", choices = names(values$data))
        })
        
        observeEvent(input$analyze, {
          req(values$data, input$target)
          analyzer <- DataAnalyzer$new()
          analyzer$data <- values$data
          
          exploration <- analyzer$explore_data()
          model_result <- analyzer$build_model(input$target)
          
          values$exploration <- exploration
          values$model_result <- model_result
        })
        
        output$data_table <- DT::renderDataTable(values$data)
        output$summary <- renderPrint(values$exploration$summary)
        output$plots <- renderPlotly(ggplotly(values$exploration$distribution_plot))
        output$model_results <- renderPrint(values$model_result)
      }
      
      shinyApp(ui, server)
    }
  )
)

# Usage
analyzer <- DataAnalyzer$new("data.csv")
exploration <- analyzer$explore_data()
model_result <- analyzer$build_model("target_column")
```

## 🚀 MLOps and Deployment

### Production Pipeline

```python
# mlops_deployment.py - Production ML deployment
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import List
import uvicorn

# Load trained model
model_artifacts = joblib.load("model.pkl")
model = model_artifacts['model']
scaler = model_artifacts['scaler']

app = FastAPI(title="ML Prediction API", version="1.0.0")

class PredictionRequest(BaseModel):
    features: List[float]

class PredictionResponse(BaseModel):
    prediction: float
    probability: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Prepare data
        features = np.array(request.features).reshape(1, -1)
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0].max()
        
        return PredictionResponse(
            prediction=float(prediction),
            probability=float(probability)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🔧 Context Engineering for Data Science

### System Context Template

```markdown
# Data Science Context Template

## System Context Layer
- Senior Data Scientist with MLOps expertise
- Statistical modeling and ML specialist
- Big data and cloud platform expert
- Business intelligence and analytics focus

## Domain Context Layer
- Languages: Python, R, SQL, Scala
- ML Frameworks: Scikit-learn, PyTorch, TensorFlow
- Data Tools: Pandas, Spark, Dask, Jupyter
- Visualization: Matplotlib, Plotly, Tableau
- MLOps: MLflow, Kubeflow, Docker, Kubernetes

## Task Context Layer
- Data volume and complexity requirements
- Model performance and accuracy targets
- Real-time vs batch processing needs
- Regulatory and compliance requirements
- Scalability and monitoring considerations
```

### Model Monitoring Template

```python
# model_monitoring.py - Production model monitoring
import evidently
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset
import pandas as pd

def monitor_model_performance(reference_data: pd.DataFrame, 
                            current_data: pd.DataFrame,
                            target_column: str):
    """Monitor model for data drift and performance degradation"""
    
    # Create drift report
    drift_report = Report(metrics=[
        DataDriftPreset(),
        TargetDriftPreset()
    ])
    
    drift_report.run(reference_data=reference_data, 
                    current_data=current_data,
                    column_mapping={'target': target_column})
    
    # Save report
    drift_report.save_html("drift_report.html")
    
    return drift_report
```

## 📚 Key Takeaways

1. **Data Quality First**: Ensure high-quality, clean data for reliable models
2. **Experiment Tracking**: Use MLflow or similar tools for reproducibility
3. **Model Validation**: Comprehensive testing and cross-validation
4. **Production Readiness**: Scalable deployment with monitoring
5. **Continuous Learning**: Regular model retraining and updates
6. **Business Impact**: Focus on metrics that drive business value

---

**Next**: [Blockchain Development →](blockchain.md)