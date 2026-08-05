# ServicePro

ServicePro is organized as three independently deployable applications:

- `website/` — TanStack Start web frontend
- `backend/` — Express and MongoDB API
- `mobile/` — React Native mobile application

## Website development

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>/website
npm i
npm run dev
```

For Railway, set the frontend service root directory to `website` and the API
service root directory to `backend`.

## Website stack

- TanStack Start
- TypeScript
- React
- Tailwind CSS
