#ifndef _APP_HTTPD_H_
#define _APP_HTTPD_H_

#include "esp_http_server.h"

extern httpd_handle_t camera_httpd;
extern httpd_handle_t stream_httpd;

#ifdef __cplusplus
extern "C" {
#endif

void startCameraServer();

#ifdef __cplusplus
}
#endif

#endif // _APP_HTTPD_H_
