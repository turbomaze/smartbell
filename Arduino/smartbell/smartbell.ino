/*
 * ---PIN SETUP---
 * INT -- 2 (digital)
 * SDA -- A4
 * SCL -- A5
 * GND -- GND (power)
 * VCC -- 5V (power)
 */
 
#include<Wire.h>
#include <Adafruit_CC3000.h>
#include <SPI.h>
#include "utility/debug.h"
#include "utility/socket.h"

// wifi shield settings
#define ADAFRUIT_CC3000_IRQ   3  // MUST be an interrupt pin!
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10
Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT, SPI_CLOCK_DIVIDER);
#define WLAN_SSID       "MIT"
#define WLAN_PASS       ""
#define WLAN_SECURITY   WLAN_SEC_UNSEC
Adafruit_CC3000_Client client;
uint32_t ip;

// sensor settings
const int MPU_addr=0x68;  // I2C address of the MPU-6050 (not exactly sure how this works...)

// tolerances/config
const int TICK = 100; // number of milliseconds to delay between ticks
const int REP_TOLERANCE = 4; // higher means more change in extension is required to count as a rep
const int REP_WARNING = 10; // how big difference should be to warn that you should go higher
const int DEBUG = false;

// server stuff
const char host[] = "ec2-52-91-248-203.compute-1.amazonaws.com";

// sensor readings
int AcX,AcY,AcZ; // acceleration stuff
float tmp; // temparature in Celsius
int gxv,gyv,gzv; // gyro x,y,z (angular) velocity
int gx,gy,gz; // gyro x,y,z (angular) position

// rep info
bool upward_extension;
int uptarget_extension;
int downtarget_extension;
int current_extension;
int extreme_extension;
int rep_counter;
int rep_timer;
int rep_quality;


// connect to wifi via shield
void connectWifi() {
  Serial.print(F("\nBeginning to connect to ")); Serial.print(WLAN_SSID); Serial.println("...");
  if (!cc3000.begin()) { Serial.println("Failed to begin!"); while(1); }
  Serial.println("Connecting...");
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) { Serial.println("Failed to connect!"); while(1); }
  Serial.println("Getting self IP address...");
  while (!cc3000.checkDHCP()) { delay(100); }
  Serial.println("Connected!");
}


// initializes sensors
void initSensor() {
  // not exactly sure how this works...
  Wire.begin();
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Serial.begin(9600);

  // initialize angles as 0
  gx = 0;
  gy = 0;
  gz = 0;

  if (DEBUG) { Serial.println("Sensors initalized!"); }
}


// get all sensor readings
void getReadings() {
  // not exactly sure how this works...
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr,14,true);

  // get acceleration
  AcX=Wire.read()<<8|Wire.read();
  AcY=Wire.read()<<8|Wire.read();
  AcZ=Wire.read()<<8|Wire.read();

  // get temperature
  tmp=(Wire.read()<<8|Wire.read())/340.00+36.53; // (converts to Celsius)

  // get gyro velocity
  gxv=Wire.read()<<8|Wire.read();
  gyv=Wire.read()<<8|Wire.read();
  gzv=Wire.read()<<8|Wire.read();



  // increment gyro position
  gx += round(gxv/1500);
  gy += round(gyv/1500);
  gz += round(gzv/1500);
}


// print all sensor readings
void printReadings() {
  Serial.print("x | y | z : ");
  Serial.print(gx);
  Serial.print(" | ");
  Serial.print(gy);
  Serial.print(" | ");
  Serial.print(gz);
  Serial.print("   ||   ");
}


// check if new extension value counts as rep; if so increment counter
void checkRep(int new_extension) {

  // update current extension
  current_extension = new_extension;

  // update extreme extension
  if (upward_extension) {
    extreme_extension = max(extreme_extension, current_extension);
  } else {
    extreme_extension = min(extreme_extension, current_extension);
  }

  // print extension values
  if (DEBUG) {
    Serial.print("cur: ");
    Serial.print(current_extension);
    Serial.print(", ext: ");
    Serial.print(extreme_extension);
  }

  // check if current and extreme differ by tolerance; if so, count as rep
  if (abs(extreme_extension - current_extension) > REP_TOLERANCE) {
    if (upward_extension) {

      rep_quality = 100;
      Serial.println(rep_timer);

      if (rep_timer > 4500) {
        Serial.println('q');
        rep_quality -= 20;
      }
      if (rep_timer < 1500) {
        Serial.println('h');
        rep_quality -= 20;
      }
      
      rep_counter += 1;

      if (rep_counter % 5 == 0) {
        Serial.println('x');
      }
      
      if (DEBUG) { Serial.print("\nREP COUNT: "); Serial.println(rep_counter); }
      if (DEBUG) { Serial.print("\tEXTENSION: "); Serial.print(extreme_extension); }
      if (DEBUG) { Serial.print("\tTARGET: "); Serial.print(uptarget_extension); }
      if (extreme_extension < uptarget_extension - REP_WARNING) {
        if (DEBUG) { Serial.print("\tHIGHER!"); }
        Serial.println('u');
        rep_quality -= 20;
      }

      logRep(rep_quality, rep_timer);
      rep_timer = 0;
      uptarget_extension = 0.2 * uptarget_extension + 0.8 * extreme_extension;
    } else {
      if (extreme_extension > downtarget_extension + REP_WARNING) {
        if (DEBUG) { Serial.print("\tLOWER!"); }
        Serial.println('y');
      } else {
//        Serial.println('x');
      }
      downtarget_extension = 0.2 * downtarget_extension + 0.8 * extreme_extension;
    }
    upward_extension = !upward_extension;
  }
}


void getIP() {
  ip = cc3000.IP2U32(52,91,248,203);
//  cc3000.getHostByName((char *)host, &ip);
  Serial.print("Got server IP address...");
}

void sendRequest() {
  // get client

  Serial.println(client.connected());
  client = cc3000.connectTCP(ip, 3000);

  // send request
  if(client.connected()) {
    Serial.println(F("Issuing HTTP request..."));
    client.fastrprint(F("POST / HTTP/1.1\r\n"));
    client.fastrprint(F("Host: ec2-52-91-248-203.compute-1.amazonaws.com:3000\r\n"));
    client.fastrprint(F("data: 555\rn"));
    client.println();
  } else {
    Serial.println(F("failed"));
  }

  // log response
  Serial.println(F("----------Response-------------------------"));

  unsigned long lastRead = millis();
  while (client.connected() && (millis() - lastRead < 3000)) {
    while (client.available()) {
      char c = client.read();
      Serial.print(c);
      lastRead = millis();
    }
  }
  client.close();

  Serial.println(F("----------End response-------------------------"));

  // disconnect
  Serial.println(F("\n\nDisconnecting"));
  cc3000.disconnect();
}


void logRep(int q, int t) {
  
}


void setup(){
  Serial.begin(9600);
//  connectWifi();
//  getIP();
//  sendRequest();
  initSensor();
  rep_counter = 0; 
  rep_timer = 0;
  Serial.println('z');
}

void loop(){
  
  getReadings();
  if (DEBUG) printReadings();
  
  checkRep(gz);
  
  if (DEBUG) Serial.println("");
  rep_timer += TICK;
  delay(TICK);
}

/*
 * u = too low
 * x = good job
 * y = too high
 * z = you can start
 * q = faster
 * h = slower
 */
