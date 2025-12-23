#!/usr/bin/env python3
"""
Simple web server for Dark Kenneth Triad web interface.

Serves the static HTML interface at http://localhost:8000
"""

import asyncio
import os
from pathlib import Path
from aiohttp import web, CORS
import aiohttp_cors


BASE_DIR = Path(__file__).parent
WEB_DIR = BASE_DIR / "web"


async def index(request: web.Request) -> web.Response:
    """Serve the main HTML page."""
    html_path = WEB_DIR / "index.html"
    if not html_path.exists():
        return web.Response(
            text="Web interface not found. Build first.",
            status=404
        )
    return web.Response(
        text=html_path.read_text(),
        content_type="text/html"
    )


async def health(request: web.Request) -> web.Response:
    """Health check endpoint."""
    return web.json_response({
        "status": "healthy",
        "service": "dark-kenneth-triad-web",
        "version": "0.1.0"
    })


async def audit(request: web.Request) -> web.Response:
    """Run audit endpoint (for future SDK integration)."""
    try:
        data = await request.json()
        document = data.get("document", "")
        enable_web_search = data.get("enable_web_search", False)

        if not document:
            return web.json_response(
                {"error": "No document provided"},
                status=400
            )

        # For now, return static analysis
        # In production, this would call the actual SDK
        from my_agent.agent import analyze_document

        results = analyze_document(document)

        return web.json_response(results)

    except Exception as e:
        return web.json_response(
            {"error": str(e)},
            status=500
        )


def setup_cors(app: web.Application) -> None:
    """Setup CORS for the application."""
    cors = CORS(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*"
        )
    })

    for route in list(app.router.routes()):
        cors.add(route)


def create_app() -> web.Application:
    """Create and configure the web application."""
    app = web.Application()

    # Routes
    app.router.add_get("/", index)
    app.router.add_get("/health", health)
    app.router.add_post("/api/audit", audit)

    # Setup CORS
    setup_cors(app)

    return app


async def main() -> None:
    """Run the web server."""
    host = os.environ.get("WEB_HOST", "0.0.0.0")
    port = int(os.environ.get("WEB_PORT", "8000"))

    app = create_app()

    print(f"╔════════════════════════════════════════════════════════════╗")
    print(f"║        DARK KENNETH TRIAD - WEB INTERFACE                  ║")
    print(f"╚════════════════════════════════════════════════════════════╝")
    print()
    print(f"Server running at http://{host}:{port}")
    print(f"Press Ctrl+C to stop")
    print()

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host, port)
    await site.start()

    try:
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
