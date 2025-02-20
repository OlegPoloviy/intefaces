#include <stdio.h>
#include <math.h>


double f(double x) {
    return x + pow(x, 1.0/2) + pow(x, 1.0/3) - 2.5;
}

int main() {
    double a, b;
    int N;

    printf("Enter beginning of the interval a: ");
    scanf("%lf", &a);
    printf("Enter the end of the inteval b: ");
    scanf("%lf", &b);
    printf("Enter number of tabulation points N: ");
    scanf("%d", &N);
    
    if (N <= 1 || a >= b) {
        printf("Invalid data.\n");
        return 1;
    }
    
    double step = (b - a) / (N - 1);
    
    printf("\nTabulation:\n");
    printf(" x\t	 f(x)\n");
    printf("------------------------\n");
    
    for (int i = 0; i < N; i++) {
        double x = a + i * step;
        printf("%.4f\t %.4f\n", x, f(x));
    }
    
    return 0;
}

