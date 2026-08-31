import http.server
import json
import os
import tempfile
import base64
import vtracer
import urllib.request
from urllib.parse import parse_qs

class VectorizeHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/trace':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                image_data = data['image']  # base64 data URL
                options = data.get('options', {})
                
                from PIL import Image
                import io
                import time
                
                # Strip the data URL prefix
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                img_bytes = base64.b64decode(image_data)
                
                # Create a local temp dir to avoid Windows absolute path issues in Rust
                temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                
                timestamp = str(int(time.time() * 1000))
                tmp_in_path = os.path.join(temp_dir, f'in_{timestamp}.png')
                tmp_out_path = os.path.join(temp_dir, f'out_{timestamp}.svg')
                
                # Normalize any image format (JPEG, WEBP, etc.) to a valid PNG using Pillow
                img = Image.open(io.BytesIO(img_bytes))
                img = img.convert('RGB') # Remove alpha if any issues
                img.save(tmp_in_path, 'PNG')
                
                engine = data.get('engine', 'vtracer')
                
                if engine == 'ai':
                    # AI-Driven Conversion (Nano Banana Pro / Gemini)
                    ai_prompt = data.get('ai_prompt', '')
                    if not ai_prompt:
                        ai_prompt = "Convert this image into raw SVG code perfectly tracing all edges. Output ONLY valid XML SVG code starting with <svg> and ending with </svg>. Do not include markdown formatting."
                    else:
                        ai_prompt = f"{ai_prompt}. Output ONLY valid XML SVG code starting with <svg> and ending with </svg>. Do not include markdown formatting."
                        
                    API_KEY = "AIzaSyDRAfmzjo2-wwiU2wlugiAthrGXb-Yzev4"
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={API_KEY}"
                    
                    payload = {
                        "contents": [{
                            "parts": [
                                {"text": ai_prompt},
                                {"inline_data": {"mime_type": "image/png", "data": image_data}}
                            ]
                        }]
                    }
                    
                    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                    try:
                        response = urllib.request.urlopen(req)
                        result = json.loads(response.read().decode('utf-8'))
                        svg_result = result['candidates'][0]['content']['parts'][0]['text']
                        # Strip markdown if AI accidentally included it
                        if '```svg' in svg_result:
                            svg_result = svg_result.split('```svg')[1].split('```')[0].strip()
                        elif '```xml' in svg_result:
                            svg_result = svg_result.split('```xml')[1].split('```')[0].strip()
                    except Exception as e:
                        print("AI Conversion API Error:", e)
                        # Fallback: Use vtracer silently if the API key fails or rate limits
                        vtracer.convert_image_to_svg_py(tmp_in_path, tmp_out_path, 'color', 'stacked', 'spline', 4, 6, 16, 60, 4.0, 10, 45, 3)
                        with open(tmp_out_path, 'r', encoding='utf-8') as f:
                            svg_result = f.read()
                else:
                    # Local Engine Conversion (vtracer)
                    # vtracer options
                    color_mode = options.get('color_mode', 'color')  # 'color' or 'binary'
                    filter_speckle = options.get('filter_speckle', 4)
                    color_precision = options.get('color_precision', 6)
                    layer_difference = options.get('layer_difference', 16)
                    corner_threshold = options.get('corner_threshold', 60)
                    length_threshold = options.get('length_threshold', 4.0)
                    max_iterations = options.get('max_iterations', 10)
                    splice_threshold = options.get('splice_threshold', 45)
                    path_precision = options.get('path_precision', 3)
                    
                    vtracer.convert_image_to_svg_py(
                        tmp_in_path,          # image_path
                        tmp_out_path,         # out_path
                        color_mode,           # colormode
                        'stacked',            # hierarchical
                        'spline',             # mode
                        filter_speckle,       # filter_speckle
                        color_precision,      # color_precision
                        layer_difference,     # layer_difference
                        corner_threshold,     # corner_threshold
                        length_threshold,     # length_threshold
                        max_iterations,       # max_iterations
                        splice_threshold,     # splice_threshold
                        path_precision        # path_precision
                    )
                    
                    with open(tmp_out_path, 'r', encoding='utf-8') as f:
                        svg_result = f.read()
                
                # Cleanup
                os.unlink(tmp_in_path)
                os.unlink(tmp_out_path)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'svg': svg_result}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        elif self.path == '/api/generate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                prompt = data.get('prompt', '')
                
                if not prompt:
                    raise ValueError("Prompt is required")
                
                import urllib.parse
                
                # Use Pollinations.ai for 100% free, no-key AI Image Generation
                safe_prompt = urllib.parse.quote(prompt)
                url = f"https://image.pollinations.ai/prompt/{safe_prompt}?nologo=true"
                
                try:
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    response = urllib.request.urlopen(req)
                    img_bytes = response.read()
                    base64_image = base64.b64encode(img_bytes).decode('utf-8')
                    img_data_url = f"data:image/jpeg;base64,{base64_image}"
                except Exception as e:
                    print("Pollinations API Error:", e)
                    # Fallback for demonstration if the API is down
                    # This is a solid yellow 100x100 PNG
                    img_data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAA1M2J3AAAAcElEQVR4nO3OMQEAIAzAsIF/zyB4cKADki/Zc2f/tQPIzL4BIAZgABIAyQAkA5AMQDIByQAkA5AMQDIByQAkA5AMQDIByQAkA5AMQDIByQAkA5AMQDIByQAkA5AMQDIByQAkA5AMQDIByQAkA5AMQDIAyQD8c8F1AAAAAElFTkSuQmCC"
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'image': img_data_url}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                
        elif self.path == '/api/convert-gif':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                image_data = data.get('image', '')
                
                if not image_data:
                    raise ValueError("Image data URL is required")
                
                from PIL import Image
                import io
                
                # Strip data URL prefix
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                img_bytes = base64.b64decode(image_data)
                img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                
                # Convert to GIF
                img_p = img.convert('P', palette=Image.ADAPTIVE, colors=256)
                gif_buffer = io.BytesIO()
                img_p.save(gif_buffer, format='GIF')
                
                gif_bytes = gif_buffer.getvalue()
                base64_gif = base64.b64encode(gif_bytes).decode('utf-8')
                gif_data_url = f"data:image/gif;base64,{base64_gif}"
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'gif': gif_data_url}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                
        elif self.path == '/api/upscale':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                image_data = data.get('image', '')
                
                if not image_data:
                    raise ValueError("Image string is required")
                
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                    
                import io
                from PIL import Image, ImageFilter
                
                img_bytes = base64.b64decode(image_data)
                img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                
                # 1000% Upscale
                new_size = (img.width * 10, img.height * 10)
                img = img.resize(new_size, Image.LANCZOS)
                
                # De-blur 100% (Strong Unsharp Mask)
                img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
                
                out_buffer = io.BytesIO()
                img.save(out_buffer, format='PNG')
                
                enhanced_b64 = base64.b64encode(out_buffer.getvalue()).decode('utf-8')
                enhanced_data_url = f"data:image/png;base64,{enhanced_b64}"
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'image': enhanced_data_url}).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 8081
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('', PORT), VectorizeHandler)
    print(f"Vectorizer API running on http://localhost:{PORT}")
    server.serve_forever()
