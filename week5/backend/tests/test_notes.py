def test_create_and_list_notes(client):
    payload = {"title": "Test", "content": "Hello world"}
    r = client.post("/notes/", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["title"] == "Test"

    r = client.get("/notes/")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1

    r = client.get("/notes/search/")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data

    r = client.get("/notes/search/", params={"q": "Hello"})
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert len(data["items"]) >= 1


def test_notes_without_trailing_slash_returns_json(client):
    """Test that /notes (without trailing slash) returns JSON, not HTML."""
    # TestClient follows redirects by default, so we get the final response
    r = client.get("/notes")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.headers["content-type"].startswith("application/json"), \
        f"Expected JSON, got {r.headers.get('content-type')}: {r.text[:100]}"
    # Should be a list of notes
    assert isinstance(r.json(), list), "Expected JSON array"


def test_notes_search_without_trailing_slash(client):
    """Test that /notes/search (without trailing slash) returns JSON."""
    r = client.get("/notes/search")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.headers["content-type"].startswith("application/json"), \
        f"Expected JSON, got {r.headers.get('content-type')}"
    data = r.json()
    assert "items" in data
    assert "total" in data


def test_search_pagination_returns_correct_subset(client):
    """Test pagination returns correct subset of results."""
    # Create multiple notes
    for i in range(15):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    # Request first page with 5 items
    r = client.get("/notes/search/", params={"page": 1, "page_size": 5})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 5
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 5

    # Request second page
    r = client.get("/notes/search/", params={"page": 2, "page_size": 5})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 5
    assert data["page"] == 2


def test_search_pagination_empty_last_page(client):
    """Test request beyond available pages returns empty results."""
    # Create a few notes
    client.post("/notes/", json={"title": "Note 1", "content": "Content 1"})

    # Request page beyond available
    r = client.get("/notes/search/", params={"page": 100, "page_size": 10})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 0
    assert data["total"] == 1  # Still have 1 total


def test_search_pagination_large_page_size(client):
    """Test page_size larger than total returns all items."""
    # Create 3 notes
    for i in range(3):
        client.post("/notes/", json={"title": f"Note {i}", "content": f"Content {i}"})

    # Request page_size larger than total
    r = client.get("/notes/search/", params={"page": 1, "page_size": 100})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 3
    assert data["total"] == 3


def test_search_with_query_returns_matching_notes(client):
    """Test basic search with query returns matching notes."""
    client.post("/notes/", json={"title": "Python Tutorial", "content": "Learn Python"})
    client.post("/notes/", json={"title": "JavaScript Guide", "content": "Learn JS"})

    r = client.get("/notes/search/", params={"q": "Python"})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) >= 1
    assert any("Python" in note["title"] or "Python" in note["content"] for note in data["items"])


def test_search_case_insensitive_title(client):
    """Test case-insensitive search on title."""
    client.post("/notes/", json={"title": "PYTHON", "content": "lowercase content"})
    client.post("/notes/", json={"title": "python", "content": "uppercase title"})

    r = client.get("/notes/search/", params={"q": "python"})
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 2


def test_search_case_insensitive_content(client):
    """Test case-insensitive search on content."""
    client.post("/notes/", json={"title": "Title 1", "content": "HELLO WORLD"})
    client.post("/notes/", json={"title": "Title 2", "content": "hello world"})

    r = client.get("/notes/search/", params={"q": "hello"})
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 2


def test_search_no_matches_returns_empty(client):
    """Test search with no matches returns empty array with total=0."""
    r = client.get("/notes/search/", params={"q": "nonexistentquery123"})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 0
    assert data["total"] == 0


def test_search_sort_by_created_desc(client):
    """Test sorting by created date descending."""
    # Create notes in known order
    client.post("/notes/", json={"title": "First", "content": "Content"})
    client.post("/notes/", json={"title": "Second", "content": "Content"})
    client.post("/notes/", json={"title": "Third", "content": "Content"})

    r = client.get("/notes/search/", params={"sort": "created_desc"})
    assert r.status_code == 200
    data = r.json()
    # Most recent first (highest ID)
    assert data["items"][0]["title"] == "Third"
    assert data["items"][2]["title"] == "First"


def test_search_sort_by_created_asc(client):
    """Test sorting by created date ascending."""
    client.post("/notes/", json={"title": "First", "content": "Content"})
    client.post("/notes/", json={"title": "Second", "content": "Content"})
    client.post("/notes/", json={"title": "Third", "content": "Content"})

    r = client.get("/notes/search/", params={"sort": "created_asc"})
    assert r.status_code == 200
    data = r.json()
    # Oldest first (lowest ID)
    assert data["items"][0]["title"] == "First"
    assert data["items"][2]["title"] == "Third"


def test_search_sort_by_title_asc(client):
    """Test sorting by title ascending."""
    client.post("/notes/", json={"title": "Zebra", "content": "Content"})
    client.post("/notes/", json={"title": "Apple", "content": "Content"})
    client.post("/notes/", json={"title": "Mango", "content": "Content"})

    r = client.get("/notes/search/", params={"sort": "title_asc"})
    assert r.status_code == 200
    data = r.json()
    assert data["items"][0]["title"] == "Apple"
    assert data["items"][1]["title"] == "Mango"
    assert data["items"][2]["title"] == "Zebra"


def test_search_sort_by_title_desc(client):
    """Test sorting by title descending."""
    client.post("/notes/", json={"title": "Zebra", "content": "Content"})
    client.post("/notes/", json={"title": "Apple", "content": "Content"})
    client.post("/notes/", json={"title": "Mango", "content": "Content"})

    r = client.get("/notes/search/", params={"sort": "title_desc"})
    assert r.status_code == 200
    data = r.json()
    assert data["items"][0]["title"] == "Zebra"
    assert data["items"][1]["title"] == "Mango"
    assert data["items"][2]["title"] == "Apple"


def test_search_invalid_sort_defaults_to_created_desc(client):
    """Test invalid sort parameter defaults to created_desc."""
    client.post("/notes/", json={"title": "Note 1", "content": "Content"})
    client.post("/notes/", json={"title": "Note 2", "content": "Content"})

    r = client.get("/notes/search/", params={"sort": "invalid_sort"})
    assert r.status_code == 200
    data = r.json()
    # Should not error, should return results
    assert len(data["items"]) >= 2


def test_search_invalid_page_defaults_to_1(client):
    """Test invalid page (0 or negative) defaults to 1."""
    client.post("/notes/", json={"title": "Note", "content": "Content"})

    r = client.get("/notes/search/", params={"page": 0})
    assert r.status_code == 200
    data = r.json()
    assert data["page"] == 1

    r = client.get("/notes/search/", params={"page": -1})
    assert r.status_code == 200
    data = r.json()
    assert data["page"] == 1


def test_search_page_size_capped_at_100(client):
    """Test page_size is capped at 100."""
    client.post("/notes/", json={"title": "Note", "content": "Content"})

    r = client.get("/notes/search/", params={"page_size": 500})
    assert r.status_code == 200
    data = r.json()
    assert data["page_size"] == 100
