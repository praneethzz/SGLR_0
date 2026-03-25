export type PerformanceLabel =
    | 'Excellent'
    | 'Good'
    | 'Average'
    | 'Below Average'
    | 'Poor';

export type ScoreColor = 'green' | 'amber' | 'orange' | 'red';

export function calculateStars(totalScore: number): 1 | 2 | 3 | 4 | 5 {
    if (totalScore >= 170) return 5;
    if (totalScore >= 130) return 4;
    if (totalScore >= 90) return 3;
    if (totalScore >= 50) return 2;
    return 1;
}

export function getPerformanceLabel(totalScore: number): PerformanceLabel {
    if (totalScore >= 170) return 'Excellent';
    if (totalScore >= 130) return 'Good';
    if (totalScore >= 90) return 'Average';
    if (totalScore >= 50) return 'Below Average';
    return 'Poor';
}

export function getScoreColor(totalScore: number): ScoreColor {
    if (totalScore >= 130) return 'green';
    if (totalScore >= 90) return 'amber';
    if (totalScore >= 50) return 'orange';
    return 'red';
}

export function getScoreHex(totalScore: number): string {
    const color = getScoreColor(totalScore);
    switch (color) {
        case 'green': return '#2ECC71';
        case 'amber': return '#F4A423';
        case 'orange': return '#FF6B35';
        case 'red': return '#E63946';
    }
}

export function calculatePercentage(totalScore: number): string {
    const pct = (totalScore / 200) * 100;
    return pct.toFixed(1) + '%';
}