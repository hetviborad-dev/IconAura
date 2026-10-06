import AppKit
import Foundation
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let iconsDirectory = root.appendingPathComponent("src/assets/icons", isDirectory: true)
let textureURL = root.appendingPathComponent("src/assets/image/leopard_print.png")
let outputDirectory = root.appendingPathComponent("src/assets/icon-packs/leopard", isDirectory: true)
try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)

guard let textureSource = CGImageSourceCreateWithURL(textureURL as CFURL, nil),
      let texture = CGImageSourceCreateImageAtIndex(textureSource, 0, nil) else {
  fatalError("Unable to load leopard texture at \(textureURL.path)")
}

let sourceFiles = try FileManager.default.contentsOfDirectory(at: iconsDirectory, includingPropertiesForKeys: nil)
  .filter { $0.lastPathComponent.hasPrefix("simple-icons--") && $0.pathExtension == "svg" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }

for sourceURL in sourceFiles {
  guard let icon = NSImage(contentsOf: sourceURL),
        let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 512, pixelsHigh: 512,
                                   bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                                   isPlanar: false, colorSpaceName: .deviceRGB,
                                   bytesPerRow: 0, bitsPerPixel: 0),
        let context = NSGraphicsContext(bitmapImageRep: rep) else {
    fputs("Skipping unreadable SVG: \(sourceURL.lastPathComponent)\n", stderr)
    continue
  }

  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = context
  context.imageInterpolation = .high
  NSColor.clear.setFill()
  NSRect(x: 0, y: 0, width: 512, height: 512).fill()
  icon.draw(in: NSRect(x: 0, y: 0, width: 512, height: 512))
  context.flushGraphics()
  NSGraphicsContext.restoreGraphicsState()

  guard let maskImage = rep.cgImage,
        let outputContext = CGContext(data: nil, width: 512, height: 512, bitsPerComponent: 8,
                                      bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
                                      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    fputs("Skipping SVG without raster alpha: \(sourceURL.lastPathComponent)\n", stderr)
    continue
  }

  outputContext.setFillColor(NSColor(red: 1, green: 0.77, blue: 0.86, alpha: 1).cgColor)
  outputContext.fill(CGRect(x: 0, y: 0, width: 512, height: 512))
  outputContext.saveGState()
  outputContext.clip(to: CGRect(x: 0, y: 0, width: 512, height: 512), mask: maskImage)

  let textureWidth = CGFloat(texture.width)
  let textureHeight = CGFloat(texture.height)
  let scale = max(512 / textureWidth, 512 / textureHeight)
  let drawWidth = textureWidth * scale
  let drawHeight = textureHeight * scale
  let textureRect = CGRect(x: (512 - drawWidth) / 2, y: (512 - drawHeight) / 2,
                           width: drawWidth, height: drawHeight)
  outputContext.interpolationQuality = .high
  outputContext.draw(texture, in: textureRect)
  outputContext.restoreGState()

  guard let result = outputContext.makeImage(),
        let destination = CGImageDestinationCreateWithURL(
          outputDirectory.appendingPathComponent(sourceURL.deletingPathExtension().lastPathComponent + ".png") as CFURL,
          UTType.png.identifier as CFString, 1, nil
        ) else {
    fatalError("Unable to write output for \(sourceURL.lastPathComponent)")
  }
  CGImageDestinationAddImage(destination, result, nil)
  guard CGImageDestinationFinalize(destination) else {
    fatalError("Unable to finalize output for \(sourceURL.lastPathComponent)")
  }
}

print("Generated \(sourceFiles.count) leopard icon assets in \(outputDirectory.path)")
