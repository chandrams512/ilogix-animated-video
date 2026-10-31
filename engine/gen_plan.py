#!/usr/bin/env python3
"""Turn a plain-text brief into a validated plan.json using any OpenAI-compatible LLM (free tiers work).

Usage:  python3 engine/gen_plan.py brief.txt plans/<name>/plan.json [--style tech-glow] [--aspect 9x16] [--max-tries 3]
Env:    LLM_BASE_URL  (default https://api.groq.com/openai/v1)   LLM_API_KEY   LLM_MODEL (default llama-3.3-70b-versatile)
        Other free options: Gemini  https://generativelanguage.googleapis.com/v1beta/openai   OpenRouter  https://openrouter.ai/api/v1
Offline test: LLM_MOCK=file.json (a file with one or more responses separated by a line '=====') skips the network.
The output goes through engine/validate_plan.py; its error list is sent back to the model until the plan passes.
"""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def system_prompt(style, aspect):
    doc = open(os.path.join(ROOT, 'docs', 'plan-format.md')).read()
    ex = open(os.path.join(ROOT, 'plans', 'sample-automation', 'plan.json')).read()
    return ("You write short animated explainer videos as JSON plans. Reply with ONE JSON object only, no markdown, no commentary.\n"
            f"Use style \"{style}\" and aspect \"{aspect}\" unless the brief says otherwise. Keep every scene 2 to 6 seconds; total length near the requested length.\n"
            "Every scene needs a short 'say' line (the caption). Use short, plain, accurate wording. Never invent statistics: if a number is needed, use one from the brief or mark it 'Sample'.\n"
            "Start with a hook scene and end with a cta scene. Mix scene types; do not repeat one type more than twice.\n\n"
            "FORMAT REFERENCE:\n" + doc + "\n\nEXAMPLE PLAN:\n" + ex)

def extract_json(txt):
    txt = re.sub(r'^```(?:json)?|```$', '', txt.strip(), flags=re.M).strip()
    a, b = txt.find('{'), txt.rfind('}')
    if a < 0 or b < 0: raise ValueError('no JSON object found')
    return json.loads(txt[a:b + 1])

def validate(plan):
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f: json.dump(plan, f); path = f.name
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'engine', 'validate_plan.py'), path], capture_output=True, text=True)
    os.unlink(path); return r.returncode == 0, (r.stdout + r.stderr).strip()

MOCK = None
def call_llm(messages):
    global MOCK
    if os.environ.get('LLM_MOCK'):
        if MOCK is None: MOCK = open(os.environ['LLM_MOCK']).read().split('\n=====\n')
        return MOCK.pop(0)
    base = os.environ.get('LLM_BASE_URL', 'https://api.groq.com/openai/v1').rstrip('/'); key = os.environ.get('LLM_API_KEY')
    if not key: sys.exit('Set LLM_API_KEY (and optionally LLM_BASE_URL, LLM_MODEL). See the header of this file.')
    body = json.dumps({'model': os.environ.get('LLM_MODEL', 'llama-3.3-70b-versatile'), 'messages': messages, 'temperature': 0.5}).encode()
    req = urllib.request.Request(base + '/chat/completions', body, {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key})
    return json.load(urllib.request.urlopen(req, timeout=120))['choices'][0]['message']['content']

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('brief'); ap.add_argument('out')
    ap.add_argument('--style', default='tech-glow'); ap.add_argument('--aspect', default='9x16'); ap.add_argument('--max-tries', type=int, default=3)
    a = ap.parse_args(); brief = open(a.brief).read()
    msgs = [{'role': 'system', 'content': system_prompt(a.style, a.aspect)}, {'role': 'user', 'content': brief}]
    for n in range(1, a.max_tries + 1):
        raw = call_llm(msgs)
        try: plan = extract_json(raw); ok, report = validate(plan)
        except Exception as e: plan, ok, report = None, False, 'Could not parse JSON: %s' % e
        if ok:
            os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True); json.dump(plan, open(a.out, 'w'), indent=2)
            print('plan ok after %d attempt(s) -> %s' % (n, a.out)); return
        print('attempt %d failed:\n%s' % (n, report), file=sys.stderr)
        msgs += [{'role': 'assistant', 'content': raw}, {'role': 'user', 'content': 'The plan failed validation. Fix every item and reply with the full corrected JSON only:\n' + report}]
    sys.exit('No valid plan after %d attempts.' % a.max_tries)

if __name__ == '__main__': main()
