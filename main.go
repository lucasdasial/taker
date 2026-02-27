package main

import (
	"fmt"
	"net/http"

	"github.com/lucasdasial/anota-gasto/internal/config"
)

func main() {
	r := config.NewRouter()
	fmt.Println("🚀 Server is running http://localhost:3000/api/")
	http.ListenAndServe(":3000", r)

}
