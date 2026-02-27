package expenses

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func BuildRouter() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)

	return r
}

func create(w http.ResponseWriter, r *http.Request) {}
func list(w http.ResponseWriter, r *http.Request)   {}
