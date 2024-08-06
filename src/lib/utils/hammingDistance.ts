export function hammingDistance(
  intendedMeter: number[],
  currentMeter: number[]
): number {
  let distance = 0;

  for (let i = 0; i < currentMeter.length; i++) {
    if (intendedMeter[i] !== currentMeter[i]) {
      distance++;
    }
  }

  return distance;
}