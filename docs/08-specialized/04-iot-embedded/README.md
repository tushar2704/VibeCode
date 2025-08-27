# 🔌 IoT & Embedded Systems Excellence

> *"Connect the physical and digital worlds with Context Engineering precision"*

## 🎯 Overview

Internet of Things (IoT) and Embedded Systems represent the bridge between digital software and physical hardware, enabling smart devices, sensor networks, and automated systems. This comprehensive section covers **IoT & Embedded Development** with **Context Engineering** methodology across microcontrollers, single-board computers, and edge computing platforms.

## 🚀 What You'll Master

- **Arduino Programming**: Microcontroller development and sensor integration
- **Raspberry Pi Projects**: Linux-based IoT systems and edge computing
- **Microcontroller Development**: Bare-metal programming and real-time systems
- **Edge Computing Solutions**: Distributed processing and intelligent edge devices
- **IoT-Specific Context Engineering**: Power optimization, connectivity, and scalability

---

## 📋 IoT & Embedded Context Engineering Template

### System Context Layer
```markdown
## Role Definition
You are a Senior IoT/Embedded Systems Engineer with expertise in hardware-software integration, sensor networks, and edge computing. You specialize in building reliable, power-efficient, and scalable IoT solutions with real-time capabilities.

## Behavioral Guidelines
- Prioritize power efficiency and battery life optimization
- Design for harsh environmental conditions and reliability
- Implement robust error handling and fault tolerance
- Focus on security from device to cloud communication
- Optimize for limited computational and memory resources
- Plan for over-the-air updates and remote management
- Consider electromagnetic interference and hardware constraints

## Quality Standards
- Power consumption optimized for target battery life
- Real-time performance guarantees for critical applications
- Security implementation from hardware to application layer
- Robust communication protocols with retry and error recovery
- Comprehensive testing including environmental stress testing
- Scalable architecture supporting thousands of devices
```

### Domain Context Layer
```markdown
## Technology Standards
- **Microcontrollers**: Arduino (AVR/ARM), ESP32/ESP8266, STM32, PIC
- **Single Board Computers**: Raspberry Pi, BeagleBone, NVIDIA Jetson
- **Communication**: Wi-Fi, Bluetooth, LoRaWAN, Zigbee, cellular (4G/5G)
- **Protocols**: MQTT, CoAP, HTTP/HTTPS, WebSocket, modbus
- **Cloud Platforms**: AWS IoT, Azure IoT, Google Cloud IoT, ThingSpeak
- **Development**: Platform IO, Arduino IDE, embedded C/C++, Python

## IoT Architecture Patterns
- **Device Layer**: Sensors, actuators, microcontroller programming
- **Connectivity Layer**: Protocol selection, mesh networks, gateway design
- **Data Processing**: Edge computing, data aggregation, filtering
- **Platform Layer**: Cloud integration, device management, analytics
- **Application Layer**: User interfaces, business logic, automation
- **Security Layer**: Device authentication, data encryption, secure updates
```

---

## 🔌 IoT Development Platforms

### [8.4.1 Arduino Programming](01-arduino.md)
**Microcontroller Development and Sensor Integration**

#### Core Components:
- **Arduino Boards**: Uno, Nano, ESP32, specialized boards for different applications
- **Programming Language**: C/C++ with Arduino framework and libraries
- **Sensor Integration**: Temperature, humidity, motion, light, environmental sensors
- **Actuator Control**: Motors, LEDs, relays, servo control systems
- **Communication**: Serial, I2C, SPI, wireless communication modules
- **Power Management**: Sleep modes, power optimization, battery monitoring

#### Context Engineering Template:
```markdown
# Arduino Development Context Template

## System Context Layer
- Arduino Developer with sensor integration and embedded C expertise
- Low-power design and battery optimization specialist
- Real-time systems and interrupt handling expert

## Domain Context Layer
- Platform: Arduino framework with ESP32/ESP8266 for Wi-Fi connectivity
- Programming: C/C++ with Arduino libraries and custom sensor libraries
- Sensors: Environmental, motion, proximity, and custom sensor integration
- Communication: Wi-Fi, Bluetooth, LoRa for wireless connectivity
- Power: Battery operation with sleep modes and power optimization
- IDE: Arduino IDE, PlatformIO for advanced development

## Task Context Layer
- Power requirements and battery life constraints
- Sensor accuracy and environmental conditions
- Real-time processing and response requirements
- Connectivity and data transmission needs
```

#### Key Patterns:
- **Sensor Data Collection**: Analog/digital sensor reading and calibration
- **Low-Power Operation**: Sleep modes, wake-on-interrupt, power management
- **Communication Protocols**: UART, I2C, SPI for sensor and module communication
- **Real-Time Processing**: Interrupt handling, timer-based operations
- **Over-The-Air Updates**: Firmware update mechanisms and version management

---

### [8.4.2 Raspberry Pi Projects](02-raspberry-pi.md)
**Linux-Based IoT Systems and Edge Computing**

#### Core Technologies:
- **Raspberry Pi Models**: Pi 4, Pi Zero, Compute Module for different applications
- **Operating Systems**: Raspberry Pi OS, Ubuntu, custom Linux distributions
- **Programming Languages**: Python, C++, Node.js for application development
- **GPIO Programming**: Hardware control, sensor integration, HAT modules
- **Computer Vision**: OpenCV, camera module, AI/ML inference at edge
- **Networking**: Ethernet, Wi-Fi, Bluetooth, cellular connectivity options

#### Context Engineering Template:
```markdown
# Raspberry Pi Context Template

## System Context Layer
- Raspberry Pi Developer with Linux and Python expertise
- Edge computing and computer vision specialist
- IoT gateway and data processing expert

## Domain Context Layer
- Hardware: Raspberry Pi 4 with GPIO expansion and camera module
- OS: Raspberry Pi OS or Ubuntu with containerization support
- Programming: Python for rapid development, C++ for performance
- Libraries: GPIO control, camera interface, machine learning inference
- Connectivity: Ethernet, Wi-Fi, Bluetooth for diverse connectivity needs
- Storage: SD card optimization, external storage, data management

## Task Context Layer
- Processing requirements and edge computing needs
- Camera and computer vision integration requirements
- Gateway functionality and protocol translation needs
- Data storage and cloud connectivity requirements
```

#### Key Patterns:
- **GPIO Control**: Hardware interface programming and sensor integration
- **Edge AI**: TensorFlow Lite, OpenCV for local machine learning inference
- **Data Gateway**: Protocol conversion, data aggregation, cloud forwarding
- **System Services**: systemd services, automatic startup, process monitoring
- **Container Deployment**: Docker containers for application deployment

---

### [8.4.3 Microcontroller Development](03-microcontrollers.md)
**Bare-Metal Programming and Real-Time Systems**

#### Core Platforms:
- **ARM Cortex-M**: STM32, NXP LPC, Atmel SAM microcontroller families
- **RISC-V**: Open-source instruction set architecture implementations
- **ESP Series**: ESP32, ESP8266 for Wi-Fi enabled applications
- **PIC Microcontrollers**: Microchip PIC family for industrial applications
- **Development Tools**: Keil, STM32CubeIDE, Platform IO, GNU toolchain
- **Real-Time OS**: FreeRTOS, Zephyr for multi-tasking applications

#### Context Engineering Template:
```markdown
# Microcontroller Development Context Template

## System Context Layer
- Embedded Systems Engineer with bare-metal programming expertise
- Real-time systems and interrupt handling specialist
- Hardware-software co-design and optimization expert

## Domain Context Layer
- MCU: ARM Cortex-M4/M7 with floating-point unit for signal processing
- RTOS: FreeRTOS for multi-tasking, real-time scheduling
- Development: C/C++ with hardware abstraction layers
- Debugging: JTAG/SWD debugging, oscilloscope, logic analyzer
- Communication: CAN, UART, SPI, I2C for industrial protocols
- Safety: Functional safety standards (ISO 26262, IEC 61508)

## Task Context Layer
- Real-time constraints and timing requirements
- Safety-critical system requirements and standards
- Resource constraints (memory, processing power)
- Environmental conditions and reliability requirements
```

#### Key Patterns:
- **Hardware Abstraction**: Register-level programming with HAL libraries
- **Interrupt Service Routines**: Efficient interrupt handling and prioritization
- **Real-Time Scheduling**: Task management with deterministic timing
- **Memory Management**: Static allocation, stack management, heap optimization
- **Power Optimization**: Clock gating, peripheral shutdown, sleep modes

---

### [8.4.4 Edge Computing Solutions](04-edge-computing.md)
**Distributed Processing and Intelligent Edge Devices**

#### Core Technologies:
- **Edge Platforms**: NVIDIA Jetson, Intel NUC, AWS Greengrass, Azure IoT Edge
- **AI/ML Inference**: TensorFlow Lite, ONNX Runtime, OpenVINO
- **Container Orchestration**: Docker, Kubernetes at the edge, K3s
- **Edge Analytics**: Stream processing, anomaly detection, predictive maintenance
- **Communication**: 5G, edge-to-cloud synchronization, mesh networking
- **Security**: Hardware security modules, secure boot, encrypted communication

#### Context Engineering Template:
```markdown
# Edge Computing Context Template

## System Context Layer
- Edge Computing Architect with distributed systems expertise
- AI/ML deployment and optimization specialist
- Industrial IoT and critical system expert

## Domain Context Layer
- Platform: NVIDIA Jetson for AI inference, industrial edge gateways
- AI/ML: TensorFlow Lite, PyTorch Mobile for edge inference
- Orchestration: Docker containers, Kubernetes for microservices
- Communication: 5G, Wi-Fi 6, industrial Ethernet protocols
- Analytics: Real-time stream processing, edge data analytics
- Security: Hardware roots of trust, secure communication channels

## Task Context Layer
- AI/ML model complexity and inference requirements
- Latency and bandwidth constraints for real-time processing
- Industrial requirements and environmental conditions
- Scalability needs for distributed edge deployment
```

#### Key Patterns:
- **Edge AI Deployment**: Model optimization, quantization, hardware acceleration
- **Data Pipeline**: Stream processing, filtering, aggregation at edge
- **Hybrid Cloud-Edge**: Workload distribution, data synchronization
- **Device Management**: Remote updates, configuration management, monitoring
- **Resilient Architecture**: Fault tolerance, graceful degradation, recovery

---

## 🎯 IoT-Specific Context Engineering

### 1. Power Optimization Context

```markdown
# IoT Power Optimization Context Template

## Battery Life Engineering
- Power Budgeting: Current consumption analysis for each component
- Sleep Modes: Deep sleep, light sleep, wake-on-interrupt strategies
- Dynamic Frequency Scaling: Clock speed adjustment based on workload
- Peripheral Management: Disable unused peripherals, selective activation
- Energy Harvesting: Solar, kinetic, thermal energy collection integration

## Low-Power Design Patterns
- Duty Cycling: Periodic operation with extended sleep periods
- Event-Driven Architecture: Wake on sensor interrupts, minimize polling
- Data Buffering: Batch data transmission to reduce radio usage
- Local Processing: Edge computation to minimize data transmission
- Progressive Shutdown: Graceful degradation as battery depletes

## Power Monitoring and Management
- Battery Monitoring: Voltage monitoring, state-of-charge estimation
- Power Profiling: Current measurement, power consumption analysis
- Adaptive Algorithms: Dynamic adjustment based on power availability
- Low-Battery Modes: Emergency operation, critical function preservation
- Charging Integration: Solar panel, wireless charging, supercapacitor backup
```

### 2. Connectivity Context

```markdown
# IoT Connectivity Context Template

## Protocol Selection
- Short Range: Bluetooth LE, Zigbee, Thread for local communication
- Medium Range: Wi-Fi for high-bandwidth local connectivity
- Long Range: LoRaWAN, NB-IoT, LTE-M for wide-area coverage
- Mesh Networks: Zigbee, Thread, Wi-Fi mesh for scalable deployment
- Wired: Ethernet, RS-485, CAN bus for industrial applications

## Communication Patterns
- Request-Response: Synchronous communication for control applications
- Publish-Subscribe: MQTT for asynchronous sensor data streaming
- Event-Driven: WebSocket for real-time bidirectional communication
- Batch Upload: Periodic data transmission for non-time-critical data
- Store-and-Forward: Local buffering with opportunistic transmission

## Network Resilience
- Connection Recovery: Automatic reconnection, exponential backoff
- Quality of Service: Priority queuing, bandwidth management
- Mesh Healing: Self-organizing networks, route optimization
- Offline Operation: Local operation during connectivity loss
- Security: End-to-end encryption, device authentication, secure protocols
```

### 3. Scalability Context

```markdown
# IoT Scalability Context Template

## Device Management
- Device Provisioning: Zero-touch deployment, automated configuration
- Firmware Updates: Over-the-air updates, rollback mechanisms
- Configuration Management: Remote parameter updates, A/B testing
- Monitoring: Device health, performance metrics, alerting
- Lifecycle Management: Commissioning, maintenance, decommissioning

## Data Architecture
- Data Collection: Sensor fusion, data validation, temporal alignment
- Edge Processing: Local analytics, data reduction, anomaly detection
- Data Transmission: Efficient protocols, compression, prioritization
- Cloud Integration: Data lakes, real-time analytics, machine learning
- Storage Optimization: Time-series databases, data retention policies

## System Architecture
- Horizontal Scaling: Load balancing, distributed processing
- Vertical Scaling: Resource optimization, performance tuning
- Geographic Distribution: Edge computing, content delivery networks
- Fault Tolerance: Redundancy, graceful degradation, disaster recovery
- Cost Optimization: Resource utilization, demand-based scaling
```

---

## 🔧 IoT Development Workflow

### 1. Hardware Development Process

```markdown
## IoT Hardware Development Workflow

### Requirements Analysis
- Use Case Definition: Application requirements, user stories
- Environmental Constraints: Temperature, humidity, vibration, EMI
- Power Requirements: Battery life, energy harvesting, power budget
- Connectivity Needs: Range, bandwidth, protocol requirements
- Size and Form Factor: Mechanical constraints, enclosure design

### Hardware Design
- Component Selection: Microcontroller, sensors, communication modules
- Circuit Design: Schematic design, PCB layout, power management
- Antenna Design: RF optimization, regulatory compliance
- Mechanical Design: Enclosure, mounting, environmental protection
- Prototyping: Breadboard, development boards, PCB prototypes

### Testing and Validation
- Unit Testing: Component-level functionality verification
- Integration Testing: System-level performance validation
- Environmental Testing: Temperature, humidity, vibration testing
- EMC Testing: Electromagnetic compatibility, regulatory compliance
- Field Testing: Real-world deployment, long-term reliability
```

### 2. Software Development Process

```markdown
## IoT Software Development Workflow

### Embedded Software Development
- Hardware Abstraction: Device drivers, peripheral interfaces
- Application Logic: Sensor processing, control algorithms
- Communication Stack: Protocol implementation, error handling
- Power Management: Sleep modes, dynamic power scaling
- Over-The-Air Updates: Secure firmware update mechanisms

### Cloud Integration
- Device Registration: Identity management, certificate provisioning
- Data Pipeline: Ingestion, processing, storage architecture
- Device Management: Configuration, monitoring, troubleshooting
- Analytics Platform: Real-time processing, machine learning
- User Interfaces: Web dashboards, mobile applications

### Testing Strategy
- Hardware-in-the-Loop: Automated testing with real hardware
- Simulation: Virtual device testing, protocol simulation
- Integration Testing: End-to-end system validation
- Load Testing: Scalability and performance validation
- Security Testing: Penetration testing, vulnerability assessment
```

### 3. Deployment and Operations

```markdown
## IoT Deployment and Operations

### Manufacturing and Provisioning
- Production Testing: Automated test equipment, quality assurance
- Device Provisioning: Security certificate installation
- Firmware Loading: Production firmware, configuration parameters
- Packaging: ESD protection, inventory management
- Supply Chain: Component sourcing, manufacturing partnerships

### Field Deployment
- Installation Planning: Site surveys, network planning
- Commissioning: Device registration, network configuration
- Testing: Connectivity validation, functionality verification
- Documentation: Installation records, maintenance procedures
- Training: User training, troubleshooting guides

### Operations and Maintenance
- Monitoring: Device health, performance metrics, alerts
- Maintenance: Predictive maintenance, scheduled updates
- Troubleshooting: Remote diagnostics, field service
- Scaling: Capacity planning, infrastructure expansion
- End-of-Life: Device decommissioning, data migration
```

---

## 🚀 Advanced IoT Topics

### 1. Industrial IoT (IIoT)

```markdown
## Industrial IoT Development

### Industrial Protocols
- Modbus: Serial and TCP variants for industrial communication
- OPC UA: Unified architecture for industrial automation
- EtherNet/IP: Industrial Ethernet for manufacturing
- PROFINET: Process field network for automation
- CAN Bus: Controller Area Network for automotive and industrial

### Safety and Reliability
- Functional Safety: ISO 26262, IEC 61508 compliance
- Redundancy: Hardware and software redundancy strategies
- Fault Detection: Real-time monitoring, diagnostic systems
- Emergency Shutdown: Safety instrumented systems, fail-safe design
- Certification: Industrial certifications, regulatory compliance

### Edge Computing in Industry
- Real-Time Control: Deterministic processing, low-latency control
- Predictive Maintenance: Vibration analysis, condition monitoring
- Quality Control: Computer vision, automated inspection
- Digital Twins: Virtual models, simulation, optimization
- Cybersecurity: Network segmentation, security monitoring
```

### 2. Smart Cities and Infrastructure

```markdown
## Smart City IoT Solutions

### Smart Infrastructure
- Traffic Management: Intelligent traffic lights, congestion monitoring
- Smart Lighting: Adaptive lighting, energy optimization
- Environmental Monitoring: Air quality, noise pollution measurement
- Waste Management: Smart bins, collection optimization
- Water Management: Leak detection, quality monitoring

### Citizen Services
- Public Safety: Emergency response, surveillance systems
- Public Transportation: Real-time tracking, route optimization
- Parking Management: Smart parking, space availability
- Energy Management: Smart grid integration, demand response
- Public Wi-Fi: Connectivity infrastructure, access management

### Data Integration
- Sensor Networks: Large-scale deployment, mesh connectivity
- Data Analytics: Real-time processing, pattern recognition
- Visualization: Dashboards, public information displays
- Privacy Protection: Data anonymization, citizen privacy
- Interoperability: Standards compliance, system integration
```

### 3. Agriculture and Environmental Monitoring

```markdown
## Agricultural IoT Applications

### Precision Agriculture
- Soil Monitoring: Moisture, pH, nutrient level sensors
- Weather Stations: Microclimate monitoring, forecast integration
- Crop Monitoring: Growth tracking, disease detection
- Irrigation Control: Automated watering, water conservation
- Livestock Monitoring: Health tracking, location monitoring

### Environmental Sensing
- Air Quality: Particulate matter, gas concentration monitoring
- Water Quality: pH, dissolved oxygen, contamination detection
- Climate Monitoring: Temperature, humidity, pressure sensing
- Biodiversity: Wildlife tracking, habitat monitoring
- Natural Disasters: Early warning systems, risk assessment

### Data Analytics
- Yield Prediction: Machine learning, historical data analysis
- Resource Optimization: Water usage, fertilizer application
- Supply Chain: Traceability, quality assurance
- Sustainability: Carbon footprint, resource efficiency
- Decision Support: AI-powered recommendations, expert systems
```

---

## 📚 Learning Resources

### Documentation
- [Arduino Documentation](https://docs.arduino.cc/) - Comprehensive Arduino development guide
- [Raspberry Pi Documentation](https://www.raspberrypi.org/documentation/) - Official Raspberry Pi resources
- [ESP32 Programming Guide](https://docs.espressif.com/projects/esp-idf/en/latest/) - ESP32 development framework
- [ARM Mbed Documentation](https://os.mbed.com/docs/) - ARM microcontroller development

### Educational Platforms
- [Arduino Project Hub](https://projecthub.arduino.cc/) - Community projects and tutorials
- [Adafruit Learn](https://learn.adafruit.com/) - Electronics and programming tutorials
- [SparkFun Tutorials](https://learn.sparkfun.com/tutorials) - Hardware and software guides
- [MagPi Magazine](https://magpi.raspberrypi.org/) - Raspberry Pi projects and tutorials

### Hardware Resources
- [Fritzing](https://fritzing.org/) - Circuit design and PCB layout tool
- [KiCad](https://kicad.org/) - Open source electronics design automation
- [Eagle](https://www.autodesk.com/products/eagle/overview) - PCB design software
- [LTSpice](https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html) - Circuit simulation

### Cloud Platforms
- [AWS IoT Core](https://aws.amazon.com/iot-core/) - Scalable IoT device connectivity
- [Azure IoT Hub](https://azure.microsoft.com/services/iot-hub/) - Bi-directional IoT communication
- [Google Cloud IoT](https://cloud.google.com/iot-core) - Secure device connection and management
- [ThingSpeak](https://thingspeak.com/) - IoT analytics platform

---

## 🎯 Quick Start Templates

### Arduino Sensor Project
```cpp
#include <WiFi.h>
#include <DHT.h>
#include <PubSubClient.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "your-wifi-ssid";
const char* password = "your-wifi-password";
const char* mqtt_server = "mqtt-broker-address";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (!isnan(temperature) && !isnan(humidity)) {
    String payload = "{\"temperature\":" + String(temperature) + 
                    ",\"humidity\":" + String(humidity) + "}";
    client.publish("sensors/data", payload.c_str());
  }
  
  delay(60000); // Send data every minute
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT broker");
    } else {
      delay(5000);
    }
  }
}
```

### Raspberry Pi GPIO Control
```python
import RPi.GPIO as GPIO
import time
import requests
import json

# GPIO setup
GPIO.setmode(GPIO.BCM)
LED_PIN = 18
BUTTON_PIN = 24

GPIO.setup(LED_PIN, GPIO.OUT)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Cloud endpoint
API_ENDPOINT = "https://api.example.com/devices"
DEVICE_ID = "raspberry-pi-001"

def send_sensor_data(data):
    try:
        response = requests.post(
            f"{API_ENDPOINT}/{DEVICE_ID}/data",
            json=data,
            timeout=10
        )
        return response.status_code == 200
    except requests.RequestException:
        return False

def main():
    try:
        while True:
            button_state = GPIO.input(BUTTON_PIN)
            
            if button_state == GPIO.LOW:
                GPIO.output(LED_PIN, GPIO.HIGH)
                
                sensor_data = {
                    "timestamp": time.time(),
                    "button_pressed": True,
                    "led_status": "on"
                }
                
                if send_sensor_data(sensor_data):
                    print("Data sent successfully")
                else:
                    print("Failed to send data")
                    
                time.sleep(0.5)
            else:
                GPIO.output(LED_PIN, GPIO.LOW)
                
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        GPIO.cleanup()

if __name__ == "__main__":
    main()
```

### Edge ML Inference
```python
import tensorflow as tf
import numpy as np
import cv2
from picamera import PiCamera
import time

# Load TensorFlow Lite model
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Initialize camera
camera = PiCamera()
camera.resolution = (224, 224)
camera.framerate = 30

def preprocess_image(image):
    # Normalize and reshape for model input
    image = image.astype(np.float32) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

def run_inference(image):
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], image)
    
    # Run inference
    start_time = time.time()
    interpreter.invoke()
    inference_time = time.time() - start_time
    
    # Get output
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    return output_data, inference_time

def main():
    try:
        # Warm up the camera
        time.sleep(2)
        
        while True:
            # Capture image
            image = np.empty((224, 224, 3), dtype=np.uint8)
            camera.capture(image, 'rgb')
            
            # Preprocess and run inference
            processed_image = preprocess_image(image)
            predictions, inference_time = run_inference(processed_image)
            
            # Process results
            predicted_class = np.argmax(predictions[0])
            confidence = predictions[0][predicted_class]
            
            print(f"Class: {predicted_class}, "
                  f"Confidence: {confidence:.2f}, "
                  f"Inference time: {inference_time*1000:.1f}ms")
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        camera.close()

if __name__ == "__main__":
    main()
```

---

**Next**: [Testing & Quality Assurance](../../09-testing-qa/README.md) | **Up**: [Specialized Development](../README.md)

*This section provides comprehensive IoT and embedded systems development strategies with Context Engineering methodology across Arduino, Raspberry Pi, microcontrollers, and edge computing platforms.*