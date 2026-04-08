---
title: Notepad++ for macOS
date: 2026-04-07
description: Native macOS port of the beloved Windows source code editor
tags: [macOS, open-source, code-editor]
---

# Notepad++ for macOS

Notepad++ has been one of the most popular source code editors on Windows for over two decades, loved by developers for its speed, simplicity, and extensive language support. I ported it to macOS as a native application, built from the ground up for both Apple Silicon and Intel Macs. The macOS version retains everything that made the original great -- syntax highlighting for 80+ programming languages, powerful regex-based search and replace, split view editing, macro recording, and a plugin ecosystem -- while feeling right at home on the Mac. It runs on macOS 11 and later, launches instantly on M-series chips, and is easy on your battery.

Under the hood, Notepad++ for macOS is written in Objective-C++ using platform-native APIs and the [Scintilla](https://www.scintilla.org/) editing component, the same engine that powers the Windows version. This ensures high performance and a small footprint without relying on emulation layers or Electron wrappers. The project is open source under the [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.html), and plugin migration from the Windows ecosystem is ongoing. The editor also ships with support for 137 interface languages out of the box. You can download it and learn more at [notepad-plus-plus-mac.org](https://notepad-plus-plus-mac.org).

![Notepad++ running on macOS](https://notepad-plus-plus-mac.org/assets/images/screenshot1.png)
