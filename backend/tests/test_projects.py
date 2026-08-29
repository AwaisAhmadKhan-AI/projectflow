def test_create_and_list_project(client):
    resp = client.post("/projects", json={"name": "Test Project", "description": "desc"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Test Project"

    listed = client.get("/projects")
    assert listed.status_code == 200
    assert any(p["id"] == body["id"] for p in listed.json())


def test_get_unknown_project_returns_404(client):
    resp = client.get("/projects/999999")
    assert resp.status_code == 404
