# SimpleDir - File Browser and Manager

A lightweight, container-ready file browser and manager built with Next.js. SimpleDir provides an intuitive web interface for browsing, downloading, moving, and archiving files and directories.

## Features

- Browse directories and files through a clean web interface
- Download files directly from the browser
- Archive directories for easy download
- Move files and folders between locations
- Modern UI built with React and Tailwind CSS
- Configurable base path for flexible deployment

## Usage

### Quick Start

```bash
docker run -p 3000:3000 -v /path/to/browse:/test alexvorobev/simpledir
```

This will start SimpleDir with the default configuration, mounting your local directory `/path/to/browse` to `/test` inside the container and exposing the web interface on port 3000.

### Docker Compose

```yaml
version: '3'

services:
  simpledir:
    image: alexvorobev/simpledir
    environment:
      PORT: 3000
      NODE_ENV: production
      BASE_PATH: /test
    volumes:
      - /path/to/browse:/test
      - ./config:/config
    ports:
      - "3000:3000"
```

### Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| PORT | The port the application will listen on | 3000 |
| BASE_PATH | Root directory for file browsing | /test |
| NODE_ENV | Node.js environment | production |

### Volumes

The container requires at least one volume mount:

- `/test` (or custom path matching your BASE_PATH): The directory you want to browse
- `/config` (optional): For additional configuration

## Security Notice

This container is intended for local network or trusted environment use. It does not include authentication by default.

## License

See the [LICENSE](LICENSE) file for details.
