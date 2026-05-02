import SwiftUI

// MARK: - Store
class HydrationStore: ObservableObject {
    @Published var totalDrank: Double = 0
    @Published var dailyTarget: Double = 5000
    @Published var drops: [WaterDrop] = []
    @Published var showCelebration: Bool = false

    var progress: Double { min(totalDrank / dailyTarget, 1.0) }
    var liters: Double { totalDrank / 1000.0 }
    var targetL: Double { dailyTarget / 1000.0 }

    func add(_ ml: Int) {
        let was = totalDrank < dailyTarget
        totalDrank += Double(ml)
        for _ in 0..<3 { drops.append(WaterDrop()) }
        if drops.count > 40 { drops = Array(drops.suffix(40)) }
        if totalDrank >= dailyTarget && was {
            showCelebration = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                self.showCelebration = false
            }
        }
    }

    func reset() {
        totalDrank = 0
        drops = []
    }
}

// MARK: - Drop Model
struct WaterDrop: Identifiable {
    let id = UUID()
    let x: CGFloat = CGFloat.random(in: 0.1...0.9)
    let size: CGFloat = CGFloat.random(in: 12...24)
    let duration: Double = Double.random(in: 1.2...2.4)
    let delay: Double = Double.random(in: 0...0.3)
}

// MARK: - Drop View
struct DropView: View {
    let drop: WaterDrop
    @State private var gone = false
    @State private var alive = true

    var body: some View {
        Group {
            if alive {
                Text("💧")
                    .font(.system(size: drop.size))
                    .offset(x: drop.x * 200 - 100, y: gone ? -200 : 50)
                    .opacity(gone ? 0 : 1)
                    .scaleEffect(gone ? 0.3 : 1.1)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + drop.delay) {
                withAnimation(.easeOut(duration: drop.duration)) { gone = true }
                DispatchQueue.main.asyncAfter(deadline: .now() + drop.duration) {
                    alive = false
                }
            }
        }
    }
}

// MARK: - Wave
struct Wave: Shape {
    var offset: Double
    var animatableData: Double {
        get { offset }
        set { offset = newValue }
    }
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: 0, y: rect.midY))
        for x in stride(from: CGFloat(0), through: rect.width, by: 2) {
            let y = rect.midY + 8 * sin(2 * .pi * (x / rect.width + CGFloat(offset)))
            p.addLine(to: CGPoint(x: x, y: y))
        }
        p.addLine(to: .init(x: rect.width, y: rect.height))
        p.addLine(to: .init(x: 0, y: rect.height))
        p.closeSubpath()
        return p
    }
}

// MARK: - Tank
struct Tank: View {
    let progress: Double
    @State private var w1: Double = 0
    @State private var w2: Double = 0.5

    var body: some View {
        GeometryReader { g in
            ZStack {
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color.white.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1.5)
                    )

                VStack(spacing: 0) {
                    Spacer(minLength: g.size.height * CGFloat(1 - progress))
                    ZStack {
                        Wave(offset: w1)
                            .fill(LinearGradient(
                                colors: [.cyan, .blue],
                                startPoint: .top,
                                endPoint: .bottom
                            ))
                            .frame(height: g.size.height * CGFloat(progress) + 20)
                        Wave(offset: w2)
                            .fill(Color.cyan.opacity(0.4))
                            .frame(height: g.size.height * CGFloat(progress) + 20)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 24))
                .animation(.spring(response: 0.7, dampingFraction: 0.7), value: progress)

                VStack {
                    Spacer()
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 18, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                        .shadow(radius: 3)
                        .padding(.bottom, 12)
                }
            }
            .onAppear {
                withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) { w1 = 1 }
                withAnimation(.linear(duration: 2.8).repeatForever(autoreverses: false)) { w2 = 1 }
            }
        }
    }
}

// MARK: - Sip Button
struct SipButton: View {
    let emoji: String
    let label: String
    let ml: Int
    let color: Color
    let action: () -> Void
    @State private var tap = false

    var body: some View {
        Button(action: {
            withAnimation(.spring(response: 0.15, dampingFraction: 0.4)) { tap = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                withAnimation(.spring(response: 0.3)) { tap = false }
            }
            action()
        }) {
            VStack(spacing: 5) {
                Text(emoji)
                    .font(.system(size: 32))
                    .scaleEffect(tap ? 1.4 : 1)
                    .animation(.spring(response: 0.2), value: tap)
                Text(label)
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                Text("+\(ml)ml")
                    .font(.system(size: 10, weight: .semibold, design: .rounded))
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(Capsule().fill(Color.white.opacity(0.2)))
                    .foregroundColor(.white.opacity(0.9))
            }
            .frame(width: 86, height: 100)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(color)
                    .shadow(color: color.opacity(0.5), radius: tap ? 2 : 10, y: tap ? 1 : 5)
            )
            .scaleEffect(tap ? 0.91 : 1)
            .animation(.spring(response: 0.2), value: tap)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Content View
struct ContentView: View {
    @StateObject private var store = HydrationStore()
    @State private var showSettings = false

    let btns: [(String, String, Int, Color)] = [
        ("💧", "Small",  100, .cyan),
        ("🥤", "Medium", 200, Color(hue: 0.56, saturation: 0.85, brightness: 0.75)),
        ("🍶", "Bottle", 330, .blue),
    ]

    var mood: String {
        switch store.progress {
        case 0..<0.2:  return "Let's go! First sip counts 💪"
        case 0.2..<0.5: return "Getting there! Keep sipping 😊"
        case 0.5..<0.8: return "Over halfway! You're killing it 🔥"
        case 0.8..<1.0: return "Almost there! Don't stop! 🎯"
        default:        return "GOAL CRUSHED! Legend! 🏆"
        }
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hue: 0.63, saturation: 0.9, brightness: 0.22),
                         Color(hue: 0.58, saturation: 0.85, brightness: 0.5)],
                startPoint: .top, endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("💧 HydrateMe")
                                .font(.system(size: 26, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                            Text(mood)
                                .font(.system(size: 13, weight: .medium, design: .rounded))
                                .foregroundColor(.white.opacity(0.75))
                        }
                        Spacer()
                        Button(action: { showSettings = true }) {
                            Image(systemName: "gearshape.fill")
                                .font(.system(size: 20))
                                .foregroundColor(.white.opacity(0.8))
                                .padding(10)
                                .background(Circle().fill(Color.white.opacity(0.12)))
                        }
                    }
                    .padding(.horizontal, 22)
                    .padding(.top, 14)

                    // Tank + particles
                    ZStack {
                        Tank(progress: store.progress)
                            .frame(width: 180, height: 250)
                        ForEach(store.drops) { d in
                            DropView(drop: d)
                                .frame(width: 220, height: 300)
                                .allowsHitTesting(false)
                        }
                    }
                    .frame(height: 270)

                    // Liters
                    VStack(spacing: 3) {
                        HStack(alignment: .lastTextBaseline, spacing: 3) {
                            Text(String(format: "%.2f", store.liters))
                                .font(.system(size: 50, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                            Text("L")
                                .font(.system(size: 26, weight: .bold, design: .rounded))
                                .foregroundColor(.white.opacity(0.6))
                        }
                        Text("of \(String(format: "%.1f", store.targetL))L goal")
                            .font(.system(size: 14, weight: .medium, design: .rounded))
                            .foregroundColor(.white.opacity(0.6))
                    }

                    // Progress bar
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.white.opacity(0.12))
                                .frame(height: 10)
                            Capsule()
                                .fill(LinearGradient(
                                    colors: [.cyan, .blue],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ))
                                .frame(width: g.size.width * CGFloat(store.progress), height: 10)
                                .animation(.spring(response: 0.6), value: store.progress)
                        }
                    }
                    .frame(height: 10)
                    .padding(.horizontal, 22)

                    // Buttons
                    HStack(spacing: 12) {
                        ForEach(btns, id: \.2) { b in
                            SipButton(emoji: b.0, label: b.1, ml: b.2, color: b.3) {
                                store.add(b.2)
                            }
                        }
                    }
                    .padding(.horizontal, 16)

                    // Reset
                    Button(action: { store.reset() }) {
                        Text("Reset Day 🔄")
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundColor(.white.opacity(0.4))
                    }
                    .padding(.bottom, 30)
                }
            }

            // Celebration overlay
            if store.showCelebration {
                ZStack {
                    Color.black.opacity(0.55).ignoresSafeArea()
                    VStack(spacing: 16) {
                        Text("🏆").font(.system(size: 70))
                        Text("GOAL CRUSHED!")
                            .font(.system(size: 26, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Text("Daily target reached! 💧")
                            .font(.system(size: 15, design: .rounded))
                            .foregroundColor(.white.opacity(0.85))
                        Text("Tap to continue")
                            .font(.system(size: 12, design: .rounded))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    .padding(36)
                    .background(
                        RoundedRectangle(cornerRadius: 28)
                            .fill(LinearGradient(
                                colors: [.blue, .cyan],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                    )
                    .padding(.horizontal, 36)
                }
                .transition(.opacity)
                .zIndex(10)
                .onTapGesture { store.showCelebration = false }
            }
        }
        .animation(.easeInOut(duration: 0.25), value: store.showCelebration)
        .sheet(isPresented: $showSettings) {
            SettingsSheet(store: store, shown: $showSettings)
                .preferredColorScheme(.dark)
        }
    }
}

// MARK: - Settings Sheet
struct SettingsSheet: View {
    @ObservedObject var store: HydrationStore
    @Binding var shown: Bool
    @State private var t: Double = 5

    var body: some View {
        NavigationView {
            ZStack {
                Color(hue: 0.63, saturation: 0.9, brightness: 0.22).ignoresSafeArea()
                VStack(spacing: 28) {
                    VStack(spacing: 12) {
                        Text("Daily Target")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                        Text("\(String(format: "%.1f", t)) L")
                            .font(.system(size: 48, weight: .black, design: .rounded))
                            .foregroundColor(.white)
                        Slider(value: $t, in: 1...10, step: 0.5)
                            .tint(.cyan)
                            .padding(.horizontal)
                    }
                    .padding(22)
                    .background(Color.white.opacity(0.08))
                    .cornerRadius(18)

                    Button(action: { store.dailyTarget = t * 1000; shown = false }) {
                        Text("Save")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 15)
                            .background(Color.blue)
                            .cornerRadius(16)
                    }
                    Spacer()
                }
                .padding(24)
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { shown = false }.foregroundColor(.cyan)
                }
            }
        }
        .onAppear { t = store.targetL }
    }
}
