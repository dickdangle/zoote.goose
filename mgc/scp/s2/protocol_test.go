package s2_test

import (
	"encoding/json"
	"testing"

	"github.com/dickdangle/zoote.goose/mgc/scp"
	"github.com/dickdangle/zoote.goose/mgc/scp/s2"
)

func TestVersion(t *testing.T) {
	p := s2.New()
	if got := p.Version(); got != scp.VersionS2 {
		t.Errorf("Version() = %q; want %q", got, scp.VersionS2)
	}
}

func TestEncodeDecode_RoundTrip(t *testing.T) {
	p := s2.New()
	input := map[string]any{"id": "42", "name": "goose"}

	b, err := p.Encode(input)
	if err != nil {
		t.Fatalf("Encode() error: %v", err)
	}

	got, err := p.Decode(b)
	if err != nil {
		t.Fatalf("Decode() error: %v", err)
	}

	if got["id"] != input["id"] || got["name"] != input["name"] {
		t.Errorf("round-trip mismatch: got %v; want %v", got, input)
	}
}

func TestEncode_MissingField(t *testing.T) {
	p := s2.New()
	_, err := p.Encode(map[string]any{"id": "1"})
	if err == nil {
		t.Error("Encode() expected error for missing 'name', got nil")
	}
}

func TestDecode_MissingField(t *testing.T) {
	p := s2.New()
	b, _ := json.Marshal(map[string]any{"id": "1"})
	_, err := p.Decode(b)
	if err == nil {
		t.Error("Decode() expected error for missing 'name', got nil")
	}
}

func TestDecode_InvalidJSON(t *testing.T) {
	p := s2.New()
	_, err := p.Decode([]byte("not json"))
	if err == nil {
		t.Error("Decode() expected error for invalid JSON, got nil")
	}
}
