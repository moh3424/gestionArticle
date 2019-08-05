<?php

namespace App\Controller;

use App\Entity\Article;
use App\Entity\Comment;
use App\Entity\Category;
use App\Form\ArticleType;
use App\Form\CommentType;
use App\Entity\ArticleLike;
use App\Repository\ArticleRepository;
use App\Repository\ArticleLikeRepository;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Repository\CategoryRepository;

class BlogController extends AbstractController
{
    /**
     * @Route("/", name="blog")
     */
    public function index(ArticleRepository $repository)
    {

        $articles = $repository->findAll();
        return $this->render('blog/index.html.twig', [
            'controller_name' => 'BlogController',
            'articles'        => $articles
        ]);
    }

    /**
     * Permet de liker ou unliker un article
     * 
     * @Route("/blog/article/{id}/like", name="article_like")
     * @param Article $article
     * @param ObjectManager $manager
     * @param ArticleLikeRepository $likerepo
     * @return Response
     */

    public function like(Article $article, ObjectManager $manager, ArticleLikeRepository $likerepo): Response
    {
        $user = $this->getUser();
        if (!$user) return $this->json([
            'code'    => 403,
            'message' => "Unauthorized"
        ], 403);

        if ($article->isLikedByUser($user)) {
            $like = $likerepo->findOneBy([
                'article'   => $article,
                'user'      => $user
            ]);

            $manager->remove($like);
            $manager->flush();

            return $this->json([
                'code'  => 200,
                'message'   => 'like bien supprimé',
                'articleLike' => $likerepo->count(['article'  => $article])
            ], 200);
        }

        $like = new ArticleLike();
        $like->setArticle($article)
            ->setUser($user);

        $manager->persist($article);
        $manager->flush();
        return $this->json([
            'code'      => 200,
            'message'   => 'Like bien ajouté',
            'articleLike'     => $likerepo->count(['article'  => $article])
        ], 200);
    }


    // /**
    //  * @Route("/", name="home")
    //  */
    // public function home(CategoryRepository $repository)
    // {
    //     $categories = $repository->findAll();
    //     return $this->render('home/home.html.twig', [
    //         'categories'  => $categories
    //     ]);
    // }

    /**
     * @Route("/blog/new", name="blog_create")
     * @Route("/blog/{id}/edit", name="blog_edit")
     */
    public function form(Article $article = null, Request $request, ObjectManager $manager)
    {
        if (!$article) {
            $article = new Article();
        }
        $form = $this->createForm(ArticleType::class, $article);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            if (!$article->getId()) {
                $article->setCreatedAt(new \DateTime());
            }
            $manager->persist($article);
            $manager->flush();
            return $this->redirectToroute('blog_show', ['id' => $article->getId()]);
        }
        return $this->render('blog/create.html.twig', [
            'article' => $article,
            'formArticle' => $form->createView()
        ]);
    }

    /**
     * @Route("/blog/{id}", name="blog_show")
     */
    public function show(Article $article, Request $request, ObjectManager $manager)
    {
        $comment = new Comment();
        $form = $this->createForm(CommentType::class, $comment);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $comment->setCreatedAt(new \DateTime())
                ->setArticle($article);

            $manager->persist($comment);
            $manager->flush();

            return $this->redirectToRoute('blog_show', [
                'id' => $article->getId()
            ]);
        }
        return $this->render('blog/show.html.twig', [
            'article' => $article,
            'commentForm' => $form->createView()
        ]);
    }
}
