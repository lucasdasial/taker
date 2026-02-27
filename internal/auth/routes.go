package auth

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func BuildRouter() chi.Router {
	r := chi.NewRouter()

	r.Post("/login", func(w http.ResponseWriter, r *http.Request) {})
	r.Post("/register", func(w http.ResponseWriter, r *http.Request) {})

	return r
}
