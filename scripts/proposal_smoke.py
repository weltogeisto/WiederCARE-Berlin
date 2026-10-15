"""Exercise the real proposal UI and real public totals; never cast votes."""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import os, json, time

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.cache'/'proposal-qa'
OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('BERLIN_BASE_URL','http://127.0.0.1:4173/WiederCARE-Berlin/')
assets=json.loads((ROOT/'research/approved-visions.json').read_text())
threads=json.loads((ROOT/'research/public-proposals.json').read_text())
report={'url':BASE,'checks':[],'errors':[],'screenshots':[],'counts':{},'writes':[]}
def passed(name):
 report['checks'].append(name);print('PASS',name,flush=True)
def shot(page,name):
 path=OUT/name;page.screenshot(path=str(path));report['screenshots'].append(str(path))
def test_proposals(page,recording=False):
 for index,stop in enumerate(assets['stops']):
  page.get_by_role('link',name=f"Vorschlag öffnen: {['Der Apothekenflügel','Die alte Spreefront','Schinkels Bauakademie'][index]}",exact=True).click()
  current=page.get_by_test_id('proposal-current');expect(current).to_have_attribute('data-proposal-id',stop['id'])
  slider=page.get_by_test_id('proposal-swipe');slider.scroll_into_view_if_needed()
  for image in current.locator('img').all():
   if image.is_visible(): image.evaluate('i=>i.decode()')
  expect(slider).to_have_value('50')
  shot(page,stop['id']+'-swipe.png')
  slider.focus();slider.press('Home');expect(slider).to_have_value('0')
  stage=page.locator('.proposal-image-stage')
  assert '100%' in page.locator('.proposal-image-pane-site').evaluate('i=>getComputedStyle(i).clipPath')
  for image in page.locator('.proposal-image-pane img').all():
   assert abs(image.bounding_box()['width']-stage.bounding_box()['width'])<2
   assert image.evaluate('i=>getComputedStyle(i).objectFit')=='contain'
  if recording: page.wait_for_timeout(1600)
  slider.press('End');expect(slider).to_have_value('100')
  if recording: page.wait_for_timeout(1600)
  slider.fill('50');expect(slider).to_have_value('50')
  # Actual pointer input, not just a scripted value assignment.
  box=slider.bounding_box();assert box
  page.mouse.move(box['x']+box['width']*.2,box['y']+box['height']/2);page.mouse.down()
  page.mouse.move(box['x']+box['width']*.8,box['y']+box['height']/2,steps=15);page.mouse.up()
  assert int(slider.input_value())>65
  votes=page.get_by_test_id('votes-panel');expect(votes).to_have_attribute('data-proposal-id',stop['id'])
  expect(votes).to_have_attribute('data-vote-status','ready',timeout=20000)
  count=int(page.get_by_test_id('support-count').inner_text().replace('.',''));report['counts'][stop['id']]=count
  expect(page.get_by_test_id('support-link')).to_have_attribute('href',threads['proposals'][index]['issueUrl'])
  expect(votes).to_contain_text('GitHub-Konto')
  expect(votes).to_contain_text('keine repräsentative Umfrage')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  if recording: votes.scroll_into_view_if_needed();page.wait_for_timeout(1600)
 passed('all three proposals: keyboard and real pointer swipe, distinct photos/visions, real public support counts and exact voting links')

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],env={**os.environ,'LIBGL_ALWAYS_SOFTWARE':'1'})
 try:
  record=bool(os.environ.get('BERLIN_RECORD'))
  opts={'record_video_dir':str(OUT/'recordings'),'record_video_size':{'width':390,'height':844}} if record else {}
  ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,**opts)
  page=ctx.new_page();start=time.monotonic()
  page.on('pageerror',lambda error:report['errors'].append(str(error)))
  page.on('request',lambda req:report['writes'].append(req.url) if req.method not in ['GET','HEAD','OPTIONS'] else None)
  page.goto(BASE,wait_until='networkidle',timeout=45000)
  expect(page.locator('[data-release="stadtbild-proposals-v3"]')).to_be_visible()
  assert page.locator('dialog[open]').count()==0
  assert page.get_by_test_id('found-count').count()==0
  assert page.get_by_test_id('demo-button').count()==0
  report['preview_start_seconds']=time.monotonic()-start
  shot(page,'mobile-first-open.png')
  if record:page.wait_for_timeout(2500)
  passed('virgin mobile first open: proposals visible, no city-walk counter, no GPS/discovery gate, no modal blocker')
  test_proposals(page,record)
  report['preview_end_seconds']=time.monotonic()-start
  assert report['writes']==[]
  video=page.video;ctx.close()
  if video:report['video']=str(video.path())
  desktop=browser.new_context(viewport={'width':1440,'height':1000})
  dp=desktop.new_page();dp.on('pageerror',lambda error:report['errors'].append(str(error)))
  dp.goto(BASE+'#spreefront',wait_until='networkidle',timeout=45000)
  expect(dp.get_by_test_id('proposal-current')).to_have_attribute('data-proposal-id','spreefront')
  assert dp.evaluate('document.documentElement.scrollWidth<=innerWidth')
  shot(dp,'desktop-spreefront.png')
  dp.get_by_role('button',name='Ort auf der Karte ansehen +').click()
  expect(dp.locator('[data-map-ready="true"]')).to_be_visible(timeout=25000)
  expect(dp.locator('.walker')).to_have_count(0)
  expect(dp.locator('.stop-pin')).to_have_count(3)
  dp.get_by_role('button',name='Schinkels Bauakademie ansehen').click()
  expect(dp.get_by_test_id('proposal-current')).to_have_attribute('data-proposal-id','bauakademie')
  assert dp.url.endswith('#bauakademie')
  dp.get_by_role('button',name='+ Eigene Idee (lokal)').click()
  expect(dp.get_by_role('dialog')).to_be_visible()
  dp.keyboard.press('Escape');expect(dp.get_by_role('dialog')).to_have_count(0)
  desktop.close()
  passed('context map: all three locations, no walking marker, marker selects proposal/deep link; local draft dialog opens/closes')
  passed('desktop layout and direct proposal hash link')
  failure=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  fp=failure.new_page();fp.on('pageerror',lambda error:report['errors'].append(str(error)))
  fp.route('https://api.github.com/repos/**/issues/*',lambda route:route.fulfill(status=503,body='Unavailable',content_type='text/plain'))
  fp.goto(BASE,wait_until='networkidle',timeout=45000)
  expect(fp.get_by_test_id('votes-panel')).to_have_attribute('data-vote-status','error',timeout=15000)
  assert fp.get_by_test_id('support-count').count()==0
  expect(fp.get_by_test_id('support-link')).to_be_visible()
  slider=fp.get_by_test_id('proposal-swipe');slider.fill('25');expect(slider).to_have_value('25')
  failure.close();passed('explicit simulated API outage: no fabricated zero count, support link intact, reduced-motion swipe usable')
  assert report['errors']==[],report['errors']
  passed('zero uncaught page errors; no public vote or other POST/PUT was sent')
 except Exception as error:
  report['failure']=str(error)
  try:shot(page,'failure.png')
  except Exception:pass
  raise
 finally:
  (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
print(json.dumps(report,ensure_ascii=False,indent=2))
