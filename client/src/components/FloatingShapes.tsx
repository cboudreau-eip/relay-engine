export default function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Circles */}
      <div
        className="absolute w-24 h-24 rounded-full bg-mint opacity-50 shape-float"
        style={{ top: '120px', left: '60px' }}
      />
      <div
        className="absolute w-16 h-16 rounded-full bg-pink opacity-40 shape-float"
        style={{ bottom: '80px', right: '200px', animationDelay: '2s' }}
      />
      <div
        className="absolute w-20 h-20 rounded-full bg-lavender opacity-40 shape-float"
        style={{ bottom: '200px', left: '400px', animationDelay: '4s' }}
      />
      <div
        className="absolute w-10 h-10 rounded-full bg-yellow opacity-50 shape-float"
        style={{ top: '300px', right: '100px', animationDelay: '1s' }}
      />
      <div
        className="absolute w-14 h-14 rounded-full bg-mint opacity-30 shape-float"
        style={{ top: '500px', right: '400px', animationDelay: '3s' }}
      />
      <div
        className="absolute w-12 h-12 rounded-full bg-pink opacity-30 shape-float"
        style={{ top: '80px', right: '300px', animationDelay: '5s' }}
      />

      {/* Diamonds */}
      <div
        className="absolute w-6 h-6 border-2 border-gray-300 rotate-45 shape-float"
        style={{ top: '200px', right: '350px', animationDelay: '2.5s' }}
      />
      <div
        className="absolute w-5 h-5 border-2 border-gray-200 rotate-45 shape-float"
        style={{ bottom: '150px', left: '500px', animationDelay: '4.5s' }}
      />
      <div
        className="absolute w-4 h-4 border-2 border-gray-300 rotate-45 shape-float"
        style={{ top: '450px', left: '200px', animationDelay: '1.5s' }}
      />

      {/* Small dots */}
      <div
        className="absolute w-3 h-3 rounded-full bg-gray-300"
        style={{ top: '400px', left: '350px' }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-gray-300"
        style={{ top: '250px', left: '700px' }}
      />

      {/* Triangle */}
      <div
        className="absolute opacity-40 shape-float"
        style={{
          bottom: '100px',
          left: '600px',
          width: 0,
          height: 0,
          borderLeft: '18px solid transparent',
          borderRight: '18px solid transparent',
          borderBottom: '30px solid #e8d4ff',
          animationDelay: '3.5s',
        }}
      />
    </div>
  );
}
