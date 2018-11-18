import os
import subprocess as sp

script_directory = os.path.dirname(os.path.abspath(__file__))
filename = 'demo_cortana.mp4'
ffmpeg_exe = 'ffmpeg'
command = [ffmpeg_exe,
            '-y',
            '-i', os.path.join(script_directory, filename),
            '-vf', 'crop=560:1080:620:0',
            '-an', os.path.join(script_directory, 'demo_cortana_crop.mp4')]
sp.call(command)

filename = 'demo_cortana_crop.mp4'
ffmpeg_exe = 'ffmpeg'
command = [ffmpeg_exe,
            '-y',
            '-i', os.path.join(script_directory, filename),
            '-vf', 'scale=280:540',
            '-r', '6',
            '-an', os.path.join(script_directory, 'demo_cortana.gif')]
sp.call(command)