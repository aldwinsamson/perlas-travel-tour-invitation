"""photoreal satin ribbon with a tied bow, rendered with cycles. outputs a transparent png (ribbon + soft contact shadow only)."""
import sys, math
import numpy as np
import bpy
from mathutils import Vector

variant = sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'wide'
scale = float(sys.argv[sys.argv.index('--')+2]) if '--' in sys.argv and len(sys.argv) > sys.argv.index('--')+2 else 1.0
samples = int(sys.argv[sys.argv.index('--')+3]) if '--' in sys.argv and len(sys.argv) > sys.argv.index('--')+3 else 128
out = sys.argv[sys.argv.index('--')+4] if '--' in sys.argv and len(sys.argv) > sys.argv.index('--')+4 else f'/home/claude/perlas-ribbon/ribbon_{variant}.png'

bpy.ops.wm.read_factory_settings(use_empty=True)
rng = np.random.default_rng(7)
W = 1.0  # ribbon width in scene units

def sm(a, b, x):
    t = np.clip((x-a)/(b-a), 0, 1); return t*t*(3-2*t)

def frame(P, ref):
    T = np.gradient(P, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    W0 = ref - (ref*T).sum(1, keepdims=True)*T
    W0 /= np.linalg.norm(W0, axis=1, keepdims=True)
    N0 = np.cross(T, W0)
    return T, W0, N0

def strip(name, P, ref, beta, width=W, M=18, cup=0.05, crinkle=0.02, notch=0.0, closed=False, seed=0, freq=3.0):
    N = len(P)
    T, W0, N0 = frame(P, ref)
    b = beta[:, None]
    Wd = np.cos(b)*W0 + np.sin(b)*N0
    Nd = -np.sin(b)*W0 + np.cos(b)*N0
    r = np.random.default_rng(seed)
    ph = r.uniform(0, 6.28, 3)
    verts = np.zeros((N, M, 3)); uvs = np.zeros((N, M, 2))
    s = np.linspace(0, 1, N)
    L = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    for j in range(M):
        v = j/(M-1)*2-1
        q = P.copy()
        if notch > 0:  # swallowtail cut: centre of the end is shorter than the edges
            cut = notch*(1-abs(v))
            sidx = np.clip(s - cut*sm(0.0, 1.0, (s-(1-notch*1.6))/(notch*1.6)), 0, 1)
            idx = sidx*(N-1)
            for k in range(3): q[:, k] = np.interp(idx, np.arange(N), P[:, k])
            Wd_j = np.stack([np.interp(idx, np.arange(N), Wd[:, k]) for k in range(3)], 1)
            Nd_j = np.stack([np.interp(idx, np.arange(N), Nd[:, k]) for k in range(3)], 1)
        else:
            Wd_j, Nd_j = Wd, Nd
        c = cup*width*(1-v*v)*0 + cup*width*(0.5-0.5*v*v)  # pillowed across the width
        wave = crinkle*width*(np.sin(L*freq+ph[0]+v*2.0)*0.6 + np.sin(L*freq*2.3+ph[1]+v*3.1)*0.4)
        verts[:, j] = q + Wd_j*(v*width/2) + Nd_j*(c + wave)[:, None]
        uvs[:, j, 0] = L/ (L[-1]+1e-9); uvs[:, j, 1] = (v+1)/2
    faces = []
    for i in range(N-1):
        for j in range(M-1):
            a = i*M+j; faces.append((a, a+1, a+M+1, a+M))
    if closed:
        for j in range(M-1):
            a = (N-1)*M+j; faces.append((a, a+1, j+1, j))
    me = bpy.data.meshes.new(name); me.from_pydata(verts.reshape(-1, 3).tolist(), [], faces); me.update()
    for p in me.polygons: p.use_smooth = True
    uv = me.uv_layers.new(name='UVMap'); flat = uvs.reshape(-1, 2)
    for li, loop in enumerate(me.loops): uv.data[li].uv = flat[loop.vertex_index]
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    sol = ob.modifiers.new('thick', 'SOLIDIFY'); sol.thickness = 0.014; sol.offset = 0
    sub = ob.modifiers.new('sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2
    return ob

# ---------------------------------------------------------------- geometry
objs = []
# main ribbon runs edge to edge, drooping slightly like it is stretched between posts
x = np.linspace(-13, 13, 420)
P = np.stack([x, 0.18 + 0.05*np.sin(x*0.7+0.6), 0.016*x**2 - 0.15 + 0.06*np.sin(x*0.9)], 1)
beta = 0.10*np.sin(x*0.8+1.0) + 0.05*np.sin(x*2.1)
objs.append(strip('run', P, np.tile([0, 0, 1.0], (len(x), 1)), beta, width=W*1.04, cup=0.10, crinkle=0.008, seed=1, freq=2.0))

def loop(side, tilt, seed, Lx=3.7, H=1.9, D=0.7, up=1):
    u = np.linspace(0, 1, 260)
    sp = np.sin(np.pi*u)
    xx = Lx*sp**0.82
    zz = H*np.sin(2*np.pi*u)*(0.50+0.50*sp)*up
    yy = -0.15 - D*sp**1.2
    pts = np.stack([xx*side, yy, zz], 1)
    # lift the loop about the knot
    c, s_ = math.cos(tilt*side), math.sin(tilt*side)
    pts = np.stack([pts[:, 0]*c - pts[:, 2]*s_*-1*0 + 0, pts[:, 1], pts[:, 2]*c + pts[:, 0]*s_], 1)
    T = np.gradient(pts, axis=0)
    ref = np.stack([-T[:, 2], np.zeros(len(u)), T[:, 0]], 1)
    beta = 0.55*np.sin(np.pi*u)*side + 0.12*np.sin(u*9)
    return strip(f'loop{seed}', pts, ref, beta, width=W*0.96, cup=0.16, crinkle=0.012, seed=seed, freq=2.6)

objs += [loop(1, 0.22, 2), loop(-1, 0.22, 3)]
# smaller upper loops give the bow its volume
objs += [loop(1, 0.62, 4, Lx=2.6, H=1.35, D=0.45), loop(-1, 0.62, 5, Lx=2.6, H=1.35, D=0.45)]

# knot band wrapped round the pinch
phi = np.linspace(0, 2*np.pi*1.06, 160)
kp = np.stack([np.zeros_like(phi), -0.62 + 0.55*np.sin(phi), 0.52*np.cos(phi)*1.0 - 0.0], 1)
objs.append(strip('knot', kp, np.tile([1.0, 0, 0], (len(phi), 1)), np.zeros(len(phi)), width=0.9, cup=0.55, crinkle=0.012, seed=9, freq=4.0))

def tail(side, seed, length=4.3):
    t = np.linspace(0, 1, 260)
    xx = side*(0.20 + 1.00*t + 0.22*np.sin(t*5.2+seed))
    yy = -0.55 - 0.25*np.sin(t*np.pi*1.2) - 0.05*t
    zz = -0.30 - length*t
    P = np.stack([xx, yy, zz], 1)
    beta = 0.75*np.sin(t*5.4+seed)*side*0.8 + 0.2*side
    return strip(f'tail{seed}', P, np.tile([1.0, 0, 0], (len(t), 1)), beta, width=W*0.96, cup=0.12, crinkle=0.03, notch=0.075, seed=seed, freq=3.0)
objs += [tail(1, 11), tail(-1, 12, 3.7)]

# a barely-visible wall to catch the soft contact shadow
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 1.9, 0), rotation=(math.pi/2, 0, 0))
import os
wall = bpy.context.active_object
if os.environ.get('NOCATCH'): wall.hide_render = True
else: wall.is_shadow_catcher = True

# ---------------------------------------------------------------- material
def principled(nt, base, rough, aniso, sheen, coat=0.0, metal=0.0, spec=0.5):
    n = nt.nodes.new('ShaderNodeBsdfPrincipled')
    n.inputs['Base Color'].default_value = (*base, 1)
    n.inputs['Roughness'].default_value = rough
    n.inputs['Metallic'].default_value = metal
    n.inputs['Anisotropic'].default_value = aniso
    n.inputs['Sheen Weight'].default_value = sheen
    n.inputs['Sheen Roughness'].default_value = 0.4
    n.inputs['Sheen Tint'].default_value = (0.18, 0.38, 0.9, 1)
    n.inputs['Coat Weight'].default_value = coat
    n.inputs['Coat Roughness'].default_value = 0.25
    n.inputs['Specular IOR Level'].default_value = spec
    return n

mat = bpy.data.materials.new('satin'); mat.use_nodes = True
nt = mat.node_tree
for n in list(nt.nodes): nt.nodes.remove(n)
outn = nt.nodes.new('ShaderNodeOutputMaterial')
uv = nt.nodes.new('ShaderNodeTexCoord')
sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(uv.outputs['UV'], sep.inputs[0])
d = nt.nodes.new('ShaderNodeMath'); d.operation = 'SUBTRACT'; nt.links.new(sep.outputs['Y'], d.inputs[0]); d.inputs[1].default_value = 0.5
ab = nt.nodes.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; nt.links.new(d.outputs[0], ab.inputs[0])
ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
el = ramp.color_ramp.elements
el[0].position = 0.0; el[0].color = (0, 0, 0, 1)
el[1].position = 0.405; el[1].color = (1, 1, 1, 1)
e2 = el.new(0.438); e2.color = (0, 0, 0, 1)
nt.links.new(ab.outputs[0], ramp.inputs['Fac'])
blue = principled(nt, (0.0012, 0.026, 0.19), 0.30, 0.85, 0.30, coat=0.10)
gold = principled(nt, (0.80, 0.50, 0.04), 0.28, 0.4, 0.0, metal=1.0)
mix = nt.nodes.new('ShaderNodeMixShader')
nt.links.new(ramp.outputs['Color'], mix.inputs['Fac'])
nt.links.new(blue.outputs['BSDF'], mix.inputs[1]); nt.links.new(gold.outputs['BSDF'], mix.inputs[2])
nt.links.new(mix.outputs[0], outn.inputs['Surface'])
tang = nt.nodes.new('ShaderNodeTangent'); tang.direction_type = 'UV_MAP'; tang.uv_map = 'UVMap'
nt.links.new(tang.outputs[0], blue.inputs['Tangent'])
# fine woven threads: noise stretched along the length
mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (14, 700, 1)
nt.links.new(uv.outputs['UV'], mp.inputs[0])
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.0; nz.inputs['Detail'].default_value = 3
nt.links.new(mp.outputs[0], nz.inputs['Vector'])
bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.22; bump.inputs['Distance'].default_value = 0.01
nt.links.new(nz.outputs['Fac'], bump.inputs['Height'])
nt.links.new(bump.outputs[0], blue.inputs['Normal'])
# gentle shade variation so it never looks flat-dyed
cv = nt.nodes.new('ShaderNodeTexNoise'); cv.inputs['Scale'].default_value = 1.4
mixc = nt.nodes.new('ShaderNodeMix'); mixc.data_type = 'RGBA'; mixc.inputs[0].default_value = 0.10
mixc.inputs[6].default_value = (0.0012, 0.026, 0.19, 1); mixc.inputs[7].default_value = (0.0006, 0.012, 0.11, 1)
scl = nt.nodes.new('ShaderNodeMath'); scl.operation='MULTIPLY'; scl.inputs[1].default_value=0.22
nt.links.new(cv.outputs['Fac'], scl.inputs[0]); nt.links.new(scl.outputs[0], mixc.inputs[0])
nt.links.new(mixc.outputs[2], blue.inputs['Base Color'])
for o in objs: o.data.materials.append(mat)

# ---------------------------------------------------------------- light, camera, render
w = bpy.data.worlds.new('w'); bpy.context.scene.world = w; w.use_nodes = True
wn = w.node_tree.nodes; wn.clear()
sky = wn.new('ShaderNodeTexSky'); sky.sky_type = 'SINGLE_SCATTERING'; sky.sun_elevation = math.radians(52); sky.sun_rotation = math.radians(-35); sky.sun_disc = False; sky.air_density = 1.0
bg = wn.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = 0.55
wo = wn.new('ShaderNodeOutputWorld')
w.node_tree.links.new(sky.outputs[0], bg.inputs[0]); w.node_tree.links.new(bg.outputs[0], wo.inputs[0])

sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 2.6; sun.angle = math.radians(14); sun.color = (1.0, 0.95, 0.86)
so = bpy.data.objects.new('sun', sun); bpy.context.collection.objects.link(so)
so.rotation_euler = (math.radians(58), math.radians(8), math.radians(-32))
# big soft key from front-right makes the satin sheen travel along the folds
area = bpy.data.lights.new('key', 'AREA'); area.energy = 2600; area.size = 14; area.shape = 'RECTANGLE'; area.size_y = 6
ao = bpy.data.objects.new('key', area); bpy.context.collection.objects.link(ao)
ao.location = (6, -16, 9); ao.rotation_euler = (math.radians(62), 0, math.radians(18))

cam = bpy.data.cameras.new('cam'); co = bpy.data.objects.new('cam', cam); bpy.context.collection.objects.link(co)
bpy.context.scene.camera = co
cam.lens = 50; cam.sensor_width = 36
if variant == 'wide':
    co.location = (0, -27, -1.2); res = (2400, 1300)
else:
    co.location = (0, -13.0, -0.9); res = (1100, 1100)
co.rotation_euler = (math.radians(90), 0, math.radians(-0.8))
cam.dof.use_dof = True; cam.dof.focus_distance = 25 if variant == 'wide' else 13; cam.dof.aperture_fstop = 11

sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples
sc.cycles.use_denoising = True; sc.cycles.max_bounces = 6
sc.render.film_transparent = True
sc.render.resolution_x = int(res[0]*scale); sc.render.resolution_y = int(res[1]*scale); sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.image_settings.color_depth = '8'
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print('done', out)
