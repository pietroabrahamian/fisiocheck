# FisioCheck

App de **check-in para uma clínica de fisioterapia**, feito em React Native (Expo) com **Firebase Authentication** e **Cloud Firestore**.

CheckPoint 3 — Mobile Application Development (FIAP).

### Integrantes

- Pietro Abrahamian
- Lucas
- Lucca
- Pedro

### Contas para teste

O projeto Firebase já está configurado e estas contas já existem:

| Perfil | E-mail | Senha |
|---|---|---|
| Dono (admin) | `admin@gmail.com` | `Admin1234` |
| Paciente | `paciente@gmail.com` | `Paciente1234` |

A **Clínica FIAP** (Av. Paulista, 1106 - Bela Vista, São Paulo - SP) já está cadastrada. Para testar o check-in de onde você estiver:

1. Entre como **dono**, abra a aba **Clínicas** e cadastre uma clínica nova tocando em **Usar minha localização atual** (ou digitando um endereço e tocando em **Buscar endereço**).
2. Saia, entre como **paciente**, escolha o profissional e toque em **Fazer check-in**. O app registra a presença na clínica em que você está.
3. Volte como dono e veja a aula no **Resumo semanal**.

> No emulador Android dá para simular a posição em **Extended controls (⋯) > Location**. Com as coordenadas da FIAP Paulista, o check-in cai na Clínica FIAP.

---

## 1. Proposta do app

### O problema

O dono da clínica paga os profissionais (fisioterapeutas/professores) **por aula dada**. Para fechar esse pagamento, ele precisa saber quantas vezes cada paciente foi à clínica na semana e com qual profissional. Hoje esse controle é feito no papel ou "de cabeça", o que gera erro e discussão.

### A solução

O próprio paciente faz o **check-in pelo celular** quando chega para a sessão. O app só aceita o check-in se o paciente **estiver fisicamente em uma das clínicas** (validação por localização), escolhendo com qual profissional vai fazer a aula. O dono pode ter **várias unidades** e acompanha tudo em um **resumo semanal**, com o total de aulas por profissional e por clínica.

### Perfis de usuário

| Perfil | Como é criado | O que pode fazer |
|---|---|---|
| **Paciente** | Cadastro pelo próprio app | Fazer check-in, ver as presenças da semana e o histórico |
| **Dono** | Uma conta cadastrada pelo app que tem o campo `role` trocado para `"dono"` no Console do Firebase | Ver o resumo semanal, cadastrar as clínicas e os profissionais |

> O papel de dono **não** pode ser escolhido pelo app: as regras do Firestore impedem que um usuário altere o próprio `role`.

### Fluxos

**Autenticação (todos)**
1. Cadastro com nome, e-mail, senha e confirmação de senha.
2. Login com e-mail e senha.
3. "Esqueci minha senha" (envio de e-mail de redefinição pelo Firebase).
4. Sessão persistente: ao reabrir o app, o usuário continua logado.
5. Logout.
6. Após o login, o app direciona para a área do perfil do usuário (paciente ou dono).

**Paciente**
1. **Check-in:** escolhe o profissional e toca em "Fazer check-in". O app pega a localização atual, descobre em qual clínica o paciente está e só registra se ele estiver dentro do raio dela.
2. **Minha semana:** mostra quantas vezes foi à clínica na semana atual e em quais dias.
3. **Histórico:** lista todos os check-ins já feitos (data e profissional).

**Dono**
1. **Resumo semanal:** total de aulas da semana, aulas por profissional (base do pagamento), aulas por clínica (quando há mais de uma), presenças por paciente e a lista de check-ins. Permite navegar entre semanas.
2. **Clínicas:** cadastra e edita as unidades: nome, endereço e raio permitido para o check-in (em metros). O local vem do endereço digitado (**Buscar endereço**) ou da localização atual do aparelho.
3. **Profissionais:** cadastra profissionais (nome e especialidade) e ativa/desativa quem aparece na lista do check-in.

### Regras de negócio

- **Um check-in por paciente por dia.** O documento do check-in tem o ID `{uid}_{AAAA-MM-DD}`, então um segundo check-in no mesmo dia é recusado.
- **Só vale na clínica.** A distância entre o paciente e a clínica precisa ser menor ou igual ao raio configurado pelo dono. Se ele estiver no raio de mais de uma, vale a mais próxima, e o check-in guarda qual foi.
- **Só profissionais ativos** aparecem para o paciente escolher.
- **Semana de segunda a domingo.** Cada check-in guarda a chave da semana (ex.: `2026-W44`), usada para contar as aulas.

### Cenários de erro e sucesso tratados

| Situação | O que o app faz |
|---|---|
| Campos vazios ou e-mail inválido | Mensagem embaixo do campo, sem chamar o Firebase |
| Senha com menos de 6 caracteres / senhas diferentes | Mensagem embaixo do campo |
| E-mail ou senha incorretos | Alerta "E-mail ou senha incorretos" |
| E-mail já cadastrado | Alerta "Já existe uma conta com este e-mail" |
| Muitas tentativas de login | Alerta pedindo para aguardar |
| Sem internet | Alerta "Sem conexão" e tela de erro com botão "Tentar novamente" |
| Permissão de localização negada | Mensagem com botão para abrir as configurações do aparelho |
| GPS desligado / localização demorando | Mensagem pedindo para ativar a localização / tentar de novo |
| Paciente longe de todas as clínicas | Mensagem com a clínica mais próxima, a distância atual e o raio permitido |
| Check-in repetido no dia | Mensagem "Você já fez check-in hoje" |
| Nenhuma clínica cadastrada / sem profissionais | Aviso no lugar do botão de check-in |
| Endereço da clínica não encontrado | Mensagem pedindo número, cidade e estado, ou para usar a localização atual |
| Lista vazia (histórico, semana sem aulas) | Estado vazio com explicação |
| Ação feita com sucesso | Confirmação na tela (check-in registrado, clínica cadastrada ou atualizada, profissional cadastrado) |

### Telas

| Paciente | Dono |
|---|---|
| Check-in (com "Minha semana") | Resumo semanal |
| Histórico | Clínicas e profissionais |
| Perfil (logout) | Perfil (logout) |

---

## 2. Como rodar

> A seção de conceitos (item 3) está mais abaixo.

### Pré-requisitos

- Node.js 20 ou superior
- App **Expo Go** no celular, ou um emulador Android
- Um projeto no [Firebase](https://console.firebase.google.com)

### Configurar o Firebase

1. Crie um projeto no Console do Firebase.
2. Em **Authentication > Método de login**, ative **E-mail/senha**.
3. Em **Firestore Database**, crie o banco.
4. Em **Firestore Database > Regras**, cole o conteúdo de [`firestore.rules`](firestore.rules) e publique.
5. Em **Configurações do projeto > Seus apps**, crie um **App da Web** e copie a configuração.
6. Copie `.env.example` para `.env` e preencha com esses valores.

### Instalar e iniciar

```bash
npm install
npx expo start
```

### Criar o primeiro dono

1. Cadastre uma conta pelo app.
2. No Console do Firebase, abra **Firestore > users > (uid da conta)** e troque o campo `role` de `"paciente"` para `"dono"`.
3. Saia e entre de novo no app: ele abre a área do dono.
4. Na aba **Clínicas**, cadastre pelo menos uma clínica e um profissional.

> No emulador Android, a localização pode ser simulada em **Extended controls (⋯) > Location**.

---

## 3. Conceitos utilizados

### Estrutura do projeto

```
app/                         Telas (expo-router: cada arquivo vira uma rota)
  _layout.tsx                Providers do app (TanStack Query + AuthContext)
  index.tsx                  Decide entre login e área logada
  (auth)/                    Login e cadastro (só para quem NÃO está logado)
  (app)/                     Área logada (só para quem está logado)
    index.tsx                Lê o perfil e manda para /paciente ou /dono
    paciente/                Abas do paciente: check-in, histórico, perfil
    dono/                    Abas do dono: resumo, clínicas, perfil
src/
  config/                    Inicialização do Firebase e do QueryClient
  contexts/AuthContext.tsx   Usuário logado (onAuthStateChanged)
  services/                  Acesso ao Firebase e à localização (sem React)
  hooks/queries.ts           Hooks do TanStack Query que as telas usam
  components/                Componentes reutilizáveis (Button, Input, Card...)
  utils/                     Datas, distância, validação e mensagens de erro
firestore.rules              Regras de segurança do Firestore
```

As telas não falam direto com o Firebase: **tela → hook (TanStack Query) → service → Firebase**. Assim cada camada tem uma responsabilidade só.

### Firebase Authentication

- **Login:** `signInWithEmailAndPassword` em [`authService.ts`](src/services/authService.ts) (aula 2).
- **Cadastro:** `createUserWithEmailAndPassword` (aula 3). Logo depois o app cria o documento `users/{uid}` com `role: "paciente"`. Se essa gravação falhar, a conta recém-criada é apagada com `deleteUser`, para não ficar um login sem perfil.
- **Esqueci minha senha:** `sendPasswordResetEmail`.
- **Logout:** `signOut`, e em seguida `queryClient.clear()` apaga o cache, para o próximo usuário não ver dados de quem saiu.
- **Sessão persistente:** em [`firebase.ts`](src/config/firebase.ts) o Auth é iniciado com `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`, o que mantém o login salvo no aparelho.
- **Quem está logado:** o [`AuthContext`](src/contexts/AuthContext.tsx) escuta `onAuthStateChanged` e só expõe `user` e `initializing`. Ele não faz login nem busca dados (essa parte fica nos services).

### Navegação protegida (expo-router)

- **Rotas por arquivo:** cada arquivo em `app/` é uma tela. As pastas entre parênteses, como `(auth)` e `(app)`, agrupam telas sem aparecer na URL.
- **Proteção das rotas:** os layouts redirecionam com `<Redirect>`:
  - `(auth)/_layout.tsx` manda para a área logada quem já entrou.
  - `(app)/_layout.tsx` manda para o login quem não está logado.
- **Perfil do usuário:**
  - `(app)/index.tsx` lê o `role` no Firestore e abre `/paciente` ou `/dono`.
  - [`RoleTabs`](src/components/RoleTabs.tsx) monta as abas (`Tabs`) e impede que um paciente abra a área do dono, e vice-versa.

### Cloud Firestore

| Coleção | Documento | Conteúdo |
|---|---|---|
| `users` | `{uid}` | `name`, `email`, `role` |
| `clinicas` | ID automático | `name`, `address`, `latitude`, `longitude`, `radiusMeters` |
| `profissionais` | ID automático | `name`, `specialty`, `active` |
| `checkins` | `{uid}_{AAAA-MM-DD}` | paciente, clínica, profissional, `date`, `week`, `distanceMeters`, `createdAt` |

- **Funções usadas:** `doc`, `getDoc`, `setDoc` (aula 4), além de `collection`, `addDoc`, `updateDoc`, `getDocs`, `query`/`where` e `serverTimestamp`.
- **ID com significado:** o ID do check-in junta o uid e a data (`{uid}_{data}`). Isso garante **um check-in por dia**. Em [`checkinService.ts`](src/services/checkinService.ts), o `runTransaction` lê esse documento e só grava se ele ainda não existir. Assim, nem dois toques rápidos no botão criam duas presenças.
- **Contagem da semana:** cada check-in guarda a semana ISO (`week: "2026-W44"`). O resumo do dono é uma consulta `where("week", "==", semana)`. Com filtros só de igualdade, não é preciso criar índice composto, e a ordenação é feita no app.
- **Horário do servidor:** `createdAt` usa `serverTimestamp()`, então o paciente não consegue mudar o horário trocando o relógio do celular.

### Regras de segurança do Firestore

O arquivo [`firestore.rules`](firestore.rules) é o que de fato protege os dados, já que qualquer pessoa poderia chamar o Firestore sem passar pelo app:

- **Perfil:** o usuário só cria o próprio `users/{uid}`, e só com `role == 'paciente'`. Ninguém consegue se promover a dono.
- **Leitura de check-ins:** o paciente só lê os próprios. O dono (`isOwner()`, que consulta o `role` com `get()`) lê todos.
- **Criação de check-in:**
  - só para o próprio paciente;
  - com o ID exatamente `{uid}_{date}`;
  - com `createdAt == request.time`;
  - para uma clínica e um profissional que existem (`exists()`).
- **Check-in gravado:** não pode ser editado nem apagado.
- **Clínicas e profissionais:** só o dono cria e altera, e com os campos validados (por exemplo, raio entre 20 e 2000 m).

### Localização (expo-location)

Visto na aula 6. Fica em [`locationService.ts`](src/services/locationService.ts):

1. **Permissão:** `requestForegroundPermissionsAsync` pede acesso. Se for negado, o app lança `LocationPermissionError`, e a tela mostra o botão "Abrir configurações" (`Linking.openSettings()`).
2. **GPS ligado:** `hasServicesEnabledAsync` confere se a localização do aparelho está ativa.
3. **Posição atual:** `getCurrentPositionAsync` pega a posição, com um **timeout de 15 s** para não deixar o paciente esperando para sempre.
4. **Distância:** a fórmula de Haversine ([`distance.ts`](src/utils/distance.ts)) calcula os metros até cada clínica. Em [`checkinService.ts`](src/services/checkinService.ts), o app escolhe a clínica em cujo raio o paciente está. Se não estiver em nenhuma, o check-in é recusado e o app mostra a distância até a mais próxima.
5. **Endereço ↔ coordenadas:** no cadastro da clínica, `geocodeAsync` transforma o endereço digitado em latitude/longitude, e `reverseGeocodeAsync` preenche o endereço quando o dono usa a localização atual.

### TanStack Query

Visto na aula 8. Em [`hooks/queries.ts`](src/hooks/queries.ts):

- **`useQuery`** busca e guarda em cache o perfil, a clínica, os profissionais e os check-ins. As telas usam `isPending` (carregando), `error` (falhou) e `data` (sucesso) para decidir o que mostrar. `refetch` atende o botão "Tentar novamente" e o "puxar para atualizar" (`RefreshControl`).
- **`useMutation`** faz o check-in, salva a clínica e cadastra ou ativa profissionais. O `isPending` mostra o carregando no botão e evita cliques duplos. O `error` mostra a falha na tela.
- **`invalidateQueries`:** depois de uma mutação, invalida a chave correspondente (por exemplo, `["checkins"]`). Isso faz a semana e o histórico se atualizarem sozinhos.
- **Perfil:** a busca do perfil usa `retry: 3`. Logo após o cadastro, o documento `users/{uid}` pode ainda estar sendo gravado.

### Hooks do React e componentes

- **`useState`:** campos dos formulários, erros de validação, profissional escolhido e semana selecionada no resumo.
- **`useEffect`:** escuta do `onAuthStateChanged` e preenchimento do formulário da clínica com os dados salvos.
- **`useMemo`:** cálculos derivados, como os check-ins da semana, os profissionais ativos e a contagem por profissional e por paciente.
- **`useContext`:** através de `useAuth()`, dá acesso ao usuário logado em qualquer tela.
- **Componentes reutilizáveis:**
  - `Button`, com variantes e estado de carregando;
  - `Input`, com mensagem de erro;
  - `Card`, `Screen` e `CheckinItem`;
  - `LoadingView`, `ErrorView`, `EmptyState` e `Notice`, para os estados de carregando, erro, vazio e aviso.
- **Componentes do React Native:**
  - `ScrollView` + `RefreshControl`, para puxar e atualizar;
  - `KeyboardAvoidingView`, para o teclado não cobrir o formulário;
  - `Switch`, para ativar ou desativar profissional;
  - `Pressable`, `Alert` e `SafeAreaView`;
  - `StyleSheet`, junto com um tema central em [`colors.ts`](src/theme/colors.ts).

### Tratamento de erros

- **Antes de chamar o Firebase:** os formulários validam os campos e mostram o erro embaixo de cada um.
- **Erros traduzidos:** [`errors.ts`](src/utils/errors.ts) converte os códigos do Firebase (`auth/invalid-credential`, `auth/email-already-in-use`, `permission-denied`, `unavailable`...) em mensagens em português.
- **Erros do próprio app:** a classe `AppError` carrega mensagens já prontas para o usuário, como "longe da clínica", "já fez check-in hoje" e "GPS desligado".
- **Toda tela que carrega dados** trata três estados: carregando, erro (com "Tentar novamente") e vazio.
