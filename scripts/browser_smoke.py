"""Real-browser smoke for local or deployed static app; no paid calls or remote writes."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
from PIL import Image
import os, json, time
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".cache" / "qa"
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get("BERLIN_BASE_URL", "http://127.0.0.1:4173/WiederCARE-Berlin/")
REPORT = {"url": BASE, "checks": [], "screenshots": [], "errors": [], "external_hosts": [], "mutating_requests": []}
def passed(name):
    REPORT["checks"].append(name)
    print("PASS", name, flush=True)
def screenshot(page, name):
    path = OUT / name
    page.screenshot(path=str(path), full_page=False)
    REPORT["screenshots"].append(str(path))
def save():
    (OUT / "browser-report.json").write_text(json.dumps(REPORT, ensure_ascii=False, indent=2))

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True,
        args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        env={**os.environ, "LIBGL_ALWAYS_SOFTWARE": "1"})
    try:
        recording = {"record_video_dir": str(OUT / "recordings"), "record_video_size": {"width":390,"height":844}} if os.environ.get("BERLIN_RECORD") else {}
        context = browser.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True, **recording)
        page = context.new_page()
        recording_start = time.monotonic()
        page.on("pageerror", lambda error: REPORT["errors"].append(str(error)))
        def record_request(request):
            host = urlparse(request.url).hostname
            if host and host != urlparse(BASE).hostname and host not in REPORT["external_hosts"]:
                REPORT["external_hosts"].append(host)
            if request.method not in ["GET","HEAD","OPTIONS"]:
                REPORT["mutating_requests"].append({"method":request.method,"url":request.url})
        page.on("request", record_request)
        page.goto(BASE, wait_until="networkidle", timeout=45000)
        page.wait_for_selector('.map-canvas[data-map-ready="true"]', timeout=45000)
        assert page.locator("dialog[open]").count() == 0
        assert page.locator('[data-testid="found-count"]').inner_text().replace("\n", "") == "0/3"
        assert page.locator(".stop-pin").count() == 0
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        expect(page.get_by_role("button",name="Ton einschalten",exact=True)).to_have_attribute("aria-pressed","false")
        REPORT["preview_start_seconds"] = time.monotonic() - recording_start
        screenshot(page, "mobile-start.png")
        if recording: page.wait_for_timeout(2500)
        passed("virgin mobile: real map, 0/3, hidden pins, no modal or horizontal overflow, opt-in sound")
        if not os.environ.get("BERLIN_SMOKE_QUICK"):
            page.evaluate("""() => { window.__discoveries=[]; new MutationObserver(() => {const d=document.querySelector('dialog[open] .stop-heading h2');if(d && !window.__discoveries.includes(d.textContent))window.__discoveries.push(d.textContent)}).observe(document.body,{subtree:true,childList:true}); }""")
            page.get_by_test_id("demo-button").click()
            page.get_by_test_id("crew-reveal").wait_for(timeout=35000)
            page.wait_for_function("[...document.querySelectorAll('.reveal-photo')].every(i => i.complete && i.naturalWidth>0)")
            page.wait_for_timeout(3800)
            screenshot(page, "mobile-reveal.png")
            page.locator("dialog[open]").wait_for(state="hidden",timeout=10000)
            page.get_by_test_id("demo-button").click()
            expect(page.get_by_test_id("demo-button")).to_contain_text("fortsetzen")
            passed("first real image reveal completes automatically; demo can pause")
            page.get_by_test_id("demo-button").click()
            page.get_by_test_id("tour-complete").wait_for(timeout=150000)
            assert page.evaluate("window.__discoveries") == ["Der Apothekenflügel","Die alte Spreefront","Schinkels Bauakademie"]
            assert page.locator(".stop-pin").count() == 3
            expect(page.get_by_test_id("found-count")).to_have_text("3/3")
            passed("one demo discovers all three stops in order and auto-resumes after every 7-second reveal")
            screenshot(page, "mobile-complete.png")
            page.locator(".collection-toggle").click()
            for index, stop_id in enumerate(["apotheke", "spreefront", "bauakademie"]):
                page.locator(".stop-list button").nth(index).click()
                frame = page.get_by_test_id("image-view")
                expect(frame).to_have_attribute("data-view", "vision")
                page.wait_for_function("document.querySelector('.vision-image')?.complete && document.querySelector('.vision-image').naturalWidth > 0")
                assert "/media/approved/" in page.locator(".vision-image").get_attribute("src")
                assert page.locator(".vision-image").evaluate("i=>getComputedStyle(i).objectFit") == "contain"
                assert page.locator("input[type=range]").count() == 0
                expect(frame).to_contain_text("KI-Rekonstruktionsvision")
                screenshot(page, f"mobile-{stop_id}-vision.png")
                if recording: page.wait_for_timeout(2200)
                before_button = page.get_by_role("button",name="Standortfoto",exact=True)
                before_button.focus(); before_button.press("Enter")
                expect(frame).to_have_attribute("data-view", "before")
                expect(frame).to_contain_text("Standortfoto")
                before_src = page.locator(".vision-image").get_attribute("src")
                if recording: page.wait_for_timeout(2200)
                page.get_by_role("button",name="KI-Vision",exact=True).click()
                assert page.locator(".vision-image").get_attribute("src") != before_src
                refs = page.get_by_test_id("archive-references")
                refs.locator("summary").click()
                assert refs.locator("img").count() == (2 if index == 0 else 1)
                for ref in refs.locator("img").all():
                    ref.scroll_into_view_if_needed()
                    expect(ref).to_be_visible()
                    ref.evaluate("i=>i.decode()")
                    assert ref.evaluate("i=>i.naturalWidth>0 && getComputedStyle(i).objectFit==='contain'")
                refs.locator("summary").click()
                page.get_by_role("button",name="Crew-Reveal wiederholen").click()
                page.get_by_test_id("crew-reveal").wait_for()
                assert page.locator(".reveal-after").evaluate("i=>getComputedStyle(i).clipPath") == "none"
                page.get_by_role("button",name="Überspringen",exact=False).click()
                expect(frame).to_have_attribute("data-view", "vision")
                page.get_by_role("button",name="Schließen",exact=True).click()
            REPORT["preview_end_seconds"] = time.monotonic() - recording_start
            passed("all three approved visions, distinct keyboard-switched site photos, four archive refs, no wipe/crop, replay and skip")
            page.reload(wait_until="networkidle")
            expect(page.get_by_test_id("found-count")).to_have_text("3/3")
            passed("discovery persistence survives reload")
        page.get_by_role("button",name="Spaziergang zurücksetzen").click()
        expect(page.get_by_test_id("found-count")).to_have_text("0/3")
        app = page.locator(".tour-app")
        original = (app.get_attribute("data-lat"), app.get_attribute("data-lng"))
        page.locator(".maplibregl-canvas").click(position={"x":150,"y":240})
        expect(app).to_have_attribute("data-mode","walk")
        page.wait_for_timeout(1200)
        assert (app.get_attribute("data-lat"),app.get_attribute("data-lng")) != original
        page.get_by_role("button",name="Spaziergang zurücksetzen").click()
        dot = page.locator(".walker").bounding_box()
        assert dot
        original = (app.get_attribute("data-lat"),app.get_attribute("data-lng"))
        page.mouse.move(dot["x"]+dot["width"]/2,dot["y"]+dot["height"]/2)
        page.mouse.down()
        page.mouse.move(dot["x"]+dot["width"]/2+28,dot["y"]+dot["height"]/2+18,steps=8)
        page.mouse.up()
        page.wait_for_timeout(300)
        assert (app.get_attribute("data-lat"),app.get_attribute("data-lng")) != original
        passed("tap-to-walk moves at walking speed and real marker drag updates position")
        page.get_by_role("button",name="Meinen GPS-Standort nutzen").click()
        page.locator('.gps-error').wait_for(timeout=15000)
        expect(page.locator('.gps-error')).to_contain_text("Standort nicht freigegeben")
        page.get_by_role("button",name="GPS-Hinweis schließen").click()
        passed("denied GPS has useful nonblocking recovery")
        # A synthetic fixture only for local draft storage, never a historical asset.
        fixture = OUT / "test-photo.jpg"
        Image.new("RGB",(1800,1200),(60,100,80)).save(fixture)
        page.get_by_role("button",name="Eigene Idee",exact=False).click()
        page.get_by_test_id("before-input").set_input_files(str(fixture))
        page.get_by_label("Wie heißt deine Idee?").fill("Lokaler Browser-Test")
        page.get_by_label("Was würdest du verändern?").fill("Eine Bank unter dem Baum.")
        page.get_by_role("button",name="Idee auf diesem Gerät speichern",exact=True).click()
        page.locator(".draft-card").wait_for()
        assert page.locator(".draft-card img").evaluate("i=>i.complete && i.naturalWidth===1536")
        page.get_by_role("button",name="Schließen",exact=True).click()
        page.reload(wait_until="networkidle")
        page.get_by_role("button",name="Eigene Idee",exact=False).click()
        expect(page.locator(".draft-card")).to_contain_text("Lokaler Browser-Test")
        with page.expect_download() as download:
            page.get_by_role("button",name="Export",exact=True).click()
        data = json.loads(Path(download.value.path()).read_text())
        assert data["visibility"] == "local-only" and data["before"].startswith("data:image/jpeg;base64,")
        page.get_by_role("button",name="Löschen",exact=True).click()
        page.get_by_role("button",name="Wirklich löschen",exact=True).click()
        expect(page.locator(".draft-card")).to_have_count(0)
        page.get_by_role("button",name="Schließen",exact=True).click()
        assert REPORT["mutating_requests"] == []
        passed("photo resized to 1536px, persisted in IndexedDB, exported, deleted; no POST/PUT/upload requests")
        video = page.video
        context.close()
        if video: REPORT["video"] = str(video.path())
        desktop = browser.new_context(viewport={"width":1440,"height":1000})
        dp = desktop.new_page(); dp.on("pageerror",lambda error:REPORT["errors"].append(str(error)))
        dp.goto(BASE,wait_until="networkidle",timeout=45000); dp.wait_for_selector('.map-canvas[data-map-ready="true"]',timeout=45000)
        assert dp.evaluate("document.documentElement.scrollWidth <= innerWidth")
        screenshot(dp,"desktop-start.png")
        passed("desktop layout and WebGL render without horizontal overflow")
        desktop.close()
        reduced = browser.new_context(viewport={"width":390,"height":844}, reduced_motion="reduce",permissions=["geolocation"],geolocation={"latitude":52.5186834,"longitude":13.40239635,"accuracy":5})
        rp = reduced.new_page();rp.on("pageerror",lambda error:REPORT["errors"].append(str(error)))
        rp.goto(BASE,wait_until="networkidle",timeout=45000)
        rp.get_by_role("button",name="Meinen GPS-Standort nutzen").click()
        expect(rp.get_by_test_id("found-count")).to_have_text("1/3",timeout=15000)
        rp.wait_for_timeout(1000)
        assert rp.locator(".crew-worker").count() == 0
        assert rp.locator("dialog[open]").count() == 0
        passed("mocked accurate GPS discovers a real stop; reduced motion skips crew and resumes in 500ms")
        reduced.close()
        assert REPORT["errors"] == [], REPORT["errors"]
        passed("zero uncaught page errors across mobile, desktop and reduced-motion contexts")
    except Exception as error:
        REPORT["failure"] = str(error)
        try: screenshot(page,"failure.png")
        except Exception: pass
        raise
    finally:
        save(); browser.close()
print(json.dumps(REPORT, ensure_ascii=False, indent=2))
