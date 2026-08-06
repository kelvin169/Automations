#include <iostream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

using namespace std;

class SoftwareDefinedRadio {
public:
  SoftwareDefinedRadio(const char* ip_address, int port_number) {
    // Create a TCP/IP socket.
    socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (socket_fd < 0) {
      cout << "Failed to create socket." << endl;
      return;
    }

    // Connect to the software defined radio component.
    sockaddr_in server_address;
    server_address.sin_family = AF_INET;
    server_address.sin_addr.s_addr = inet_addr(ip_address);  
    server_address.sin_port = htons(port_number);

    if (connect(socket_fd, (sockaddr*)&server_address, sizeof(server_address)) < 0) {
      cout << "Failed to connect to software defined radio component." << endl;
      return;
    }
  }

  ~SoftwareDefinedRadio() {
    // Close the TCP/IP socket.
    close(socket_fd);
  }

  // Sends a command to the software defined radio component.
  void SendCommand(const char* command) {
    int bytes_sent = send(socket_fd, command, strlen(command), 0);
    if (bytes_sent < 0) {
      cout << "Failed to send command to software defined radio component." << endl;
      return;
    }
  }

  // Receives a response from the software defined radio component.
  string ReceiveResponse() {
    char buffer[1024];
    int bytes_received = recv(socket_fd, buffer, sizeof(buffer), 0);
    if (bytes_received < 0) {
      cout << "Failed to receive response from software defined radio component." << endl;
      return "";
    }

    return string(buffer, bytes_received);
  }

private:
  int socket_fd;
};

int main() {
  // Create a SoftwareDefinedRadio object.
  SoftwareDefinedRadio sdr("127.0.0.1", 8080);

  // Send a command to the software defined radio component to set the frequency.
  sdr.SendCommand("set frequency 100000000");

  // Receive a response from the software defined radio component.
  string response = sdr.ReceiveResponse();

  // Print the response.
  cout << "Response: " << response << endl;

  return 0;
}