package main

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"net/http"
	"os"
	"os/user"
	"strings"
	"time"

	"github.com/kbinani/screenshot"
	"golang.org/x/image/draw"
)

func main() {
	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}

	currentUser, err := user.Current()
	if err != nil {
		panic(err)
	}

	printed := false

	// Windows has the hostname as part of the username
	parts := strings.Split(currentUser.Username, "\\")
	username := parts[len(parts)-1]

	for {
		n := screenshot.NumActiveDisplays()

		for i := 0; i < n; i++ {
			time.Sleep(1 * time.Second)
			bounds := screenshot.GetDisplayBounds(i)

			img, err := screenshot.CaptureRect(bounds)
			if err != nil {
				fmt.Println(err)
				continue
			}

			dst := image.NewRGBA(image.Rect(0, 0, img.Bounds().Max.X/2, img.Bounds().Max.Y/2))
			draw.NearestNeighbor.Scale(dst, dst.Rect, img, img.Bounds(), draw.Over, nil)

			buf := new(bytes.Buffer)
			jpeg.Encode(buf, dst, &jpeg.Options{Quality: 90})

			host := hostname
			if i > 0 {
				host = fmt.Sprintf("%s-%d", hostname, i)
			}

			url := fmt.Sprintf("http://192.168.86.3:8111/update/%s@%s", username, host)
			if !printed {
				fmt.Println("Uploading to", url)
				printed = true
			}
			req, _ := http.NewRequest(http.MethodPut, url, buf)
			if err != nil {
				fmt.Println(err)
				continue
			}

			req.Header.Set("Content-Type", "image/jpeg")
			resp, err := (&http.Client{}).Do(req)
			if err != nil {
				fmt.Println(err)
				continue
			}

			if resp.StatusCode != 200 {
				fmt.Println(resp)
				continue
			}
		}
	}
}
