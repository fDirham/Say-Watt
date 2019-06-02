#include <Servo.h>
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>         // https://github.com/tzapu/WiFiManager, must install this library!

// Set web server port number to 80
WiFiServer server(80);

// Creates servo object
Servo servod1;

// Variable to store HTTP requests
String header;

// Auxiliar variables to store the current output state
String servoPinState = "0";

// Assigns the servos to this specific pin
const int servoPin= 5;

void setup() {
  Serial.begin(115200);
  int pos = 0;
  // Initialize the output variables as outputs
  servod1.attach(servoPin);
  // WiFiManager
  // Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;

  
  // Uncomment and run it once, if you want to erase all the stored information
  //wifiManager.resetSettings();
  
  // Change values in brackets to rename
  wifiManager.autoConnect("SW TOGGLE DEVICE 1");
  
  // if you get here you have connected to the WiFi
  Serial.println("Connected.");
  
  server.begin();
}

void loop(){
  WiFiClient client = server.available();   // Listen for incoming clients

  if (client) {                             // If a new client connects,
    Serial.println("New Client.");          // print a message out in the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        header += c;
        if (c == '\n') {                    // if the byte is a newline character
          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println("Connection: close");
            client.println();
            
            Serial.println("header: " + header);
            Serial.println("STOP!!!!");
            
            // turns the servos on and off
            if (header.indexOf("/turn/on") >= 0) {
              Serial.println("Turning on");
              // Turns the motors
              servod1.write(45);
              servod1.write(90);
              //Sends client back information
              if (servoPinState == "off") { //If it was off send "On_Success"
                client.println("On_Success");
              }
              if (servoPinState == "on") { //If it was on send "Already_On"
                client.println("Already_On");
              }
              servoPinState = "on"; //Tells arduino the state of the servo
            } else if (header.indexOf("/turn/off") >= 0) {
              Serial.println("Turning off");
              
              servod1.write(45);
              servod1.write(0);
              if (servoPinState == "on") {
                client.println("Off_Success");
              }
              if (servoPinState == "off") {
                client.println("Already_Off");
              }
              servoPinState = "off";
            }

            break;
          } else { // if you got a newline, then clear currentLine
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
    }
    // Clear the header variable
    header = "";
    // Close the connection
    client.stop();
    Serial.println("Client disconnected.");
    Serial.println("");
  }
}


           
