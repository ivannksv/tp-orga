! suma.asm - suma dos numeros
! Registros: %r1 = x, %r2 = y, %r3 = resultado

        .begin
        .org 2048

        ld    [x], %r1          ! %r1 <- 5
        ld    [y], %r2          ! %r2 <- 3
        addcc %r1, %r2, %r3     ! %r3 <- %r1 + %r2
        st    %r3, [z]          ! guarda el resultado en memoria
        jmpl  %r15 + 4, %r0     ! fin: vuelve al que llamo

x:      5
y:      3
z:      0

        .end

! Escribir un programa que copie un numero x al valor de z

        .begin
        .org 2048

        ld [x], %r1
        st %r1, [y]
        jmpl %r15 + 4, %r0

x:      4
y:      3

        .end

! Escribir un programa que swapee los valores x e y

        .begin
        .org 2048

        ld [x], %r1
        ld [y], %r2

        st %r1, [y]
        st %r2, [x]

        jmpl %r15 + 4, %r0

x:      5
y:      8

        .end

! Escribir un programa que calcule z = x + y - 3, con x = 10, y = 6. Al terminar
! z deberia valer 3

        .begin
        .org 2048

        ld [x], %r1
        ld [y], %r2

        addcc %r1, %r2, %r3 ! addcc suma
        subcc %r3, 3, %r3 !subcc resta
        st %r3, [z]

        jmpl %r15 + 4, %r0

x:      10
y:      6
z:      0

        .end